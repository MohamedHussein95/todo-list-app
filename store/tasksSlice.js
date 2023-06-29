import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  taskLists: [],
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    addTask: (state, action) => {
      state.taskLists?.push(action.payload);
    },
    removeTask: (state, action) => {
      state.taskLists = state.taskLists?.filter((task) =>
        action.payload.every((t) => t !== task.task)
      );
    },
    loadTasks: (state, action) => {
      state.taskLists = action.payload || [];
    },
    saveTask: (state) => {
      AsyncStorage.setItem("Tasks", JSON.stringify(state.taskLists));
    },
    completeTask: (state, action) => {
      const updatedTasks = state.taskLists?.map((task) =>
        action.payload.includes(task.task)
          ? { ...task, completed: !task.completed }
          : task
      );
      state.taskLists = updatedTasks;
    },
  },
});

export const { addTask, loadTasks, saveTask, removeTask, completeTask } =
  tasksSlice.actions;

export default tasksSlice.reducer;
