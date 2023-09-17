import React from "react";
import addNotification from "react-push-notification";

type taskData = {
  title: string;
  description: string;
  crDate: string;
  tDate: string;
  status: boolean;
};

function App() {
  const [filter, setFilter] = React.useState(0);
  const [isUpdating, setIsUpdating] = React.useState(-1);

  const taskAddHandler = () => {
    if (newTask.tDate && newTask.title) {
      const curDate = new Date();
      const month =
        curDate.getMonth() < 10 ? "0" + curDate.getMonth() : curDate.getMonth();
      const day =
        curDate.getDate() < 10 ? "0" + curDate.getDate() : curDate.getDate();

      const tempArr = [
        ...tasks,
        {
          ...newTask,
          status: false,
          crDate: `${day}.${month}.${curDate.getFullYear()}`,
        },
      ];

      setTasks(tempArr);
      localStorage.setItem("tasks", JSON.stringify(tempArr));
    }
  };

  const sortFunc = (a: taskData, b: taskData) => {
    switch (filter) {
      case 0:
        return Number(
          new Date(a.crDate).getTime() - new Date(b.crDate).getTime()
        );
      case 1:
        return Number(
          new Date(a.tDate).getTime() - new Date(b.tDate).getTime()
        );
      case 2:
        return Number(a.title.localeCompare(b.title));
    }
    return 1;
  };

  const taskUpdateHandler = () => {
    const curDate = new Date();
    const month =
      curDate.getMonth() < 10 ? "0" + curDate.getMonth() : curDate.getMonth();
    const day =
      curDate.getDate() < 10 ? "0" + curDate.getDate() : curDate.getDate();
    const tempArr = [...tasks];
    localStorage.setItem("tasks", JSON.stringify(tempArr));
    tasks[isUpdating] = {
      ...newTask,
      status: false,
      crDate: `${day}.${month}.${curDate.getFullYear()}`,
    };
    setIsUpdating(-1);
  };

  const [tasks, setTasks] = React.useState<taskData[]>([]);
  const [newTask, setNewTask] = React.useState({
    title: "",
    description: "",
    tDate: "",
  });

  React.useEffect(() => {
    let tempArr = [...tasks];
    tempArr.sort(sortFunc);

    setTasks(tempArr);
  }, [filter]);

  React.useEffect(() => {
    const storageTasks = localStorage.getItem("tasks");
    if (storageTasks) {
      setTasks(JSON.parse(storageTasks));
      JSON.parse(storageTasks).forEach((task: taskData) => {
        const remainingTime =
          new Date(task.tDate).getTime() - new Date().getTime();

        if (remainingTime > 0 && remainingTime < 86400000 && !task.status) {
          addNotification({
            title: "Срок выполнения приближается",
            subtitle: `${task.title}`,
            message: `${task.title}`,
            theme: "darkblue",
            native: true,
          });
        }
      });
    }
  }, []);

  return (
    <div>
      <h1>Планировщик задач</h1>
      <div>
        Сортировать по:
        <button onClick={() => setFilter(0)} className="sort_btn">
          Дате создания
        </button>
        <button onClick={() => setFilter(1)} className="sort_btn">
          Крайнему сроку
        </button>
        <button onClick={() => setFilter(2)} className="sort_btn">
          Названию
        </button>
      </div>
      <div id="taskList">
        {tasks.map((task, index) => (
          <div
            key={index}
            className={`task_container ${task.status ? "completed_task" : ""} ${
              new Date() > new Date(task.tDate) ? "failed_task" : ""
            }`}
          >
            <p>{task.title}</p>
            <p>{task.description}</p>
            <div className="task_minor_info">
              <p>Дата создания: {task.crDate}</p>
              <p>Крайний срок: {task.tDate.split("-").reverse().join(".")}</p>
            </div>
            <button
              onClick={() => {
                let tempArr = [...tasks];
                tempArr[index].status = true;
                setTasks(tempArr);
                localStorage.setItem("tasks", JSON.stringify(tempArr));
              }}
              className="task_done_btn"
            >
              Выполнено
            </button>
            <button
              onClick={() => {
                let tempArr = [...tasks];
                tempArr.splice(index, 1);
                setTasks(tempArr);
                localStorage.setItem("tasks", JSON.stringify(tempArr));
              }}
              className="task_delete_btn"
            >
              Удалить
            </button>
            <button
              onClick={() => {
                setNewTask({
                  title: task.title,
                  description: task.description,
                  tDate: task.tDate,
                });
                setIsUpdating(index);
              }}
              className="task_update_btn"
            >
              Изменить
            </button>
          </div>
        ))}
      </div>
      <div id="task_creation">
        <input
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          value={newTask.title}
          type="text"
          placeholder="Название"
        />
        <textarea
          onChange={(e) =>
            setNewTask({ ...newTask, description: e.target.value })
          }
          value={newTask.description}
          rows={1}
          cols={10}
          placeholder="Описание"
        />
        <input
          onChange={(e) => setNewTask({ ...newTask, tDate: e.target.value })}
          value={newTask.tDate}
          type="date"
          placeholder="Крайний срок"
        />
        <button
          onClick={isUpdating === -1 ? taskAddHandler : taskUpdateHandler}
        >{`${isUpdating === -1 ? "Добавить" : "Редактировать"}`}</button>
      </div>
    </div>
  );
}

export default App;
