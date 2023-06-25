import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Colors from "../constants/Colors";
import { useState } from "react";

const HomeScreen = () => {
  const [task, setTasks] = useState("");
  const [todoList, setTodoList] = useState([]);

  const handleAddTask = () => {
    if (task.length === 0) {
      return alert("Please enter a Task to add");
    }
    if (todoList.includes(task)) return alert("Task already added"); //if item is already added do nothing;
    setTodoList((prev) => [...prev, task]);
    setTasks("");
  };
  const handleRemoveTask = (id) => {
    const copy = [...todoList]; //copy of todoList
    const itemToBeRemoved = copy.splice(id, 1); //returns the item to be removed;
    const updatedTodoList = copy.filter((item) => item !== itemToBeRemoved); //return all the items that are not the item to be removed;
    setTodoList(updatedTodoList); //update the todo list
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>To Do List</Text>
      </View>
      {todoList.length <= 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={styles.noTask}> You have no Tasks</Text>
        </View>
      ) : (
        <View style={styles.body}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingBottom: 100,
              paddingVertical: 10,
              paddingHorizontal: 5,
            }}
            showsVerticalScrollIndicator={false}
          >
            {todoList.map((val, i) => {
              return (
                <View key={val} style={styles.task}>
                  <Text style={styles.taskText}>{val}</Text>
                  <TouchableOpacity
                    style={styles.delete}
                    onPress={() => handleRemoveTask(i)}
                    activeOpacity={0.9}
                  />
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.8}
          onPress={handleAddTask}
        >
          <Text style={styles.icon}>+</Text>
        </TouchableOpacity>
        <TextInput
          placeholder="Add Task"
          placeholderTextColor={"#D8d6d1"}
          style={styles.input}
          value={task}
          onChangeText={setTasks}
          multiline
          autoCapitalize="sentences"
          autoCorrect
        />
      </View>

      <StatusBar style="light" backgroundColor={Colors.primary} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  body: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.primary,
    width: "100%",
    marginTop: 15,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 12,
  },
  title: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 20,
  },
  footer: {
    backgroundColor: "transparent",
    width: "100%",
    padding: 20,
    position: "absolute",
    bottom: 0,
    gap: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    backgroundColor: Colors.primary,
    width: "100%",
    padding: 15,
    borderRadius: 15,
    elevation: 1,
    fontWeight: "400",
    fontSize: 17,
    color: "#fff",
    maxHeight: 172,
  },
  fab: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 200,
    width: 50,
    height: 50,
    padding: 10,
    elevation: 10,
    alignSelf: "flex-end",
  },
  icon: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "800",
  },
  task: {
    flexDirection: "row",
    marginVertical: 2,
    backgroundColor: Colors.primary,
    width: "100%",
    padding: 15,
    borderRadius: 15,
    elevation: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "space-between",
  },
  taskText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  noTask: {
    color: "#D8d6d1",
    fontSize: 20,
    fontWeight: "bold",
  },
  delete: {
    height: 20,
    width: 20,
    backgroundColor: "red",
    borderRadius: 100,
    elevation: 2,
  },
});
