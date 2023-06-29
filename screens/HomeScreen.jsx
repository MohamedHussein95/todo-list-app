import {
  AntDesign,
  Entypo,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import Checkbox from "expo-checkbox";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  SectionList,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView as safeAreaViewA } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import Colors from "../constants/Colors";
import {
  addTask,
  completeTask,
  loadTasks,
  removeTask,
  saveTask,
} from "../store/tasksSlice";

let calendar = require("dayjs/plugin/calendar");
dayjs.extend(calendar);

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const [task, setTasks] = useState("");
  const [todoList, setTodoList] = useState([]);
  const [filteredTodoList, setFilteredTodoList] = useState(null);

  const [loading, setLoading] = useState(true);

  const [searchedText, setSearchedText] = useState("");
  const [searching, setSearching] = useState(false);

  const listRef = useRef();
  const menuListRef = useRef();
  const settingsRef = useRef();

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  const [isChecked, setChecked] = useState(false);

  const [list, setList] = useState([
    "Default",
    "Learning",
    "Programming",
    "Shopping",
    "Training",
    "Exercises",
    "Studying",
    "Education",
  ]);
  const [selectedList, setSelectedList] = useState("Default");
  const [selectedMenuList, setSelectedMenuList] = useState("All List");

  const [selectedContainer, setSelectedContainer] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [addListModelOpen, setAddListModelOpen] = useState(false);
  const [menuListOpen, setMenuListOpen] = useState(false);
  const [settingsModelOpen, setSettingsModelOpen] = useState(false);
  const [settingsModelPosition, setSettingsModelPosition] = useState({
    x: width / 2,
    y: 20,
  });
  const [menuListPosition, setMenuListPosition] = useState({
    x: width / 2.95,
    y: height / 35.37,
  });

  const [newList, setNewList] = useState("");
  const [listModalPosition, setListModalPosition] = useState({
    x: width / 8.7656,
    y: height / 1.91,
  });

  const dispatch = useDispatch();

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };

  const handleAddTask = async () => {
    if (todoList?.some((item) => item.task === task)) {
      return alert("Task already added");
    }
    setModalOpen(false);
    const taskToDo = {
      id: Math.random() * 100,
      task: task,
      date: dayjs(date).format("ddd, D MMMM YYYY"),
      time: dayjs(date).format("h:mm A"),
      completed: false,
      status: "",
      list: selectedList,
    };
    const now = dayjs();
    const taskDateTime = dayjs(`${dayjs(date).format("YYYY-MM-DD HH:mm")}`);

    const nextMonthStart = now.add(1, "month").startOf("month");
    const nextMonthEnd = now.add(1, "month").endOf("month");

    if (taskDateTime.isBefore(now)) {
      taskToDo.status = "Overdue";
    } else if (taskDateTime.isSame(now, "day")) {
      taskToDo.status = "Today";
    } else if (taskDateTime.isSame(now.add(1, "day"), "day")) {
      taskToDo.status = "Tomorrow";
    } else if (
      taskDateTime.isAfter(nextMonthStart) &&
      taskDateTime.isBefore(nextMonthEnd)
    ) {
      taskToDo.status = "Next Month";
    } else if (taskDateTime.isAfter(nextMonthEnd)) {
      taskToDo.status = "Later";
    } else {
      taskToDo.status = "Few Days From Now";
    }

    setTodoList((prev) => [...(prev || []), taskToDo]);

    setTasks("");

    //save to the store
    dispatch(addTask(taskToDo));
    //shedule notifications
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${task}`,
        body: `You have a task to do on ${dayjs(date).format("h:mm")}`,
      },
      trigger: {
        date: taskDateTime.toDate(),
        repeats: true,
      },
    });
  };

  const handleDeleteTask = () => {
    const filteredTasks = todoList?.filter((todo) =>
      selectedContainer.every((item) => item !== todo.task)
    );
    setTodoList(filteredTasks);
    setSelectedContainer([]);
    dispatch(removeTask(selectedContainer));
    Toast.show(
      selectedContainer.length > 1 ? "Tasks deleted" : "Task deleted",
      {
        duration: Toast.durations.SHORT,
      }
    );
  };
  const handleCompleteTask = () => {
    const updatedTasks = todoList?.map((task) =>
      selectedContainer.includes(task.task)
        ? { ...task, completed: !task.completed }
        : task
    );
    setTodoList(updatedTasks);
    setSelectedContainer([]);
    dispatch(completeTask(selectedContainer));
  };
  const onShare = async () => {
    try {
      const selectedTasks = selectedContainer.map((task) => {
        const taskItem = todoList?.find((item) => item.task === task);
        return `• ${taskItem.task} (${taskItem.date})`;
      });

      const message = selectedTasks.join("\n");

      const result = await Share.share({
        message: message,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };
  const onFetchUpdateAsync = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        Updates.fetchUpdateAsync().then(() => {
          Updates.reloadAsync();
        });
      }
    } catch (error) {
      alert(`Error fetching latest Expo update: ${error.message}`);
    }
  };
  // Group tasks by status
  const groupedTasks = [
    { title: "Overdue", data: [] },
    { title: "Tomorrow", data: [] },
    { title: "Today", data: [] },
    { title: "Next Month", data: [] },
    { title: "Later", data: [] },
    { title: "Few Days From Now", data: [] },
  ];

  const displayList = filteredTodoList || todoList;
  displayList?.forEach((task) => {
    if (task.status === "Overdue") {
      groupedTasks[0].data.push(task);
    } else if (task.status === "Tomorrow") {
      groupedTasks[1].data.push(task);
    } else if (task.status === "Today") {
      groupedTasks[2].data.push(task);
    } else if (task.status === "Next Month") {
      groupedTasks[3].data.push(task);
    } else if (task.status === "Later") {
      groupedTasks[4].data.push(task);
    } else if (task.status === "Few Days From Now") {
      groupedTasks[5].data.push(task);
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchedText) {
        const filteredList = todoList?.filter((item) =>
          item?.task?.toLowerCase().includes(searchedText?.toLowerCase())
        );
        setFilteredTodoList(filteredList);
      } else {
        setFilteredTodoList(null); // No search query, reset filtered list
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchedText, todoList]);
  useEffect(() => {
    if (selectedMenuList === "All Lists") {
      return setFilteredTodoList(null);
    }
    const filteredList = todoList?.filter((item) =>
      item?.list?.toLowerCase().includes(selectedMenuList?.toLowerCase())
    );
    setFilteredTodoList(filteredList);
  }, [selectedMenuList]);

  useEffect(() => {
    const loadSavedTasks = async () => {
      const savedTasks = await AsyncStorage.getItem("Tasks");
      if (savedTasks) {
        setTodoList(JSON.parse(savedTasks));
        dispatch(loadTasks(JSON.parse(savedTasks)));
      }

      setLoading(false);
    };
    loadSavedTasks();
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "background") {
        dispatch(saveTask());
      }
    };
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    setSelectedContainer([]);
    return () => {
      subscription.remove();
    };
  }, []);
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"large"} color={Colors.primary} />
      </View>
    );
  }
  const SafeA = Platform.OS === "ios" ? SafeAreaView : safeAreaViewA;
  const isAndroid = Platform.OS === "android";
  const isWeb = Platform.OS === "web";
  return (
    <SafeA style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          {!searching && selectedContainer.length <= 0 && (
            <>
              <View style={{ flexDirection: "row", flex: 1, gap: 15 }}>
                <Image
                  source={
                    isAndroid || isWeb
                      ? require("../assets/logo.png")
                      : require("../assets/logo-ios.png")
                  }
                  style={{ width: 30, height: 30 }}
                />
                <Text style={styles.title}>
                  {selectedMenuList === "Default"
                    ? "All Lists"
                    : selectedMenuList}
                </Text>
                <View ref={menuListRef}>
                  <FontAwesome5
                    name="caret-down"
                    size={24}
                    color={isAndroid || isWeb ? "#fff" : Colors.primary}
                    onPress={() => setMenuListOpen(true)}
                  />
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 20 }}>
                <View ref={settingsRef}>
                  <AntDesign
                    name="search1"
                    size={24}
                    color={isAndroid || isWeb ? "#fff" : Colors.primary}
                    onPress={() => setSearching(true)}
                  />
                </View>

                <Ionicons
                  name="ellipsis-vertical"
                  size={24}
                  color={isAndroid || isWeb ? "#fff" : Colors.primary}
                  onPress={() => setSettingsModelOpen(true)}
                />
              </View>
            </>
          )}
          {searching && selectedContainer.length <= 0 && (
            <View
              style={{ flexDirection: "row", gap: 15, alignItems: "center" }}
            >
              <AntDesign
                name="left"
                size={24}
                color={isAndroid || isWeb ? "#fff" : Colors.primary}
                onPress={() => setSearching(false)}
              />
              <AntDesign
                name="search1"
                size={24}
                color={isAndroid || isWeb ? "#fff" : Colors.primary}
              />
              <TextInput
                placeholder="Search"
                placeholderTextColor={"#D8d6d1"}
                style={styles.searchInput}
                value={searchedText}
                onChangeText={setSearchedText}
                multiline
                autoFocus
                autoCapitalize="sentences"
                autoCorrect
                cursorColor={isAndroid || isWeb ? "#fff" : Colors.primary}
              />
            </View>
          )}
          {selectedContainer?.length > 0 && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  flex: 1,
                  gap: 15,
                  alignItems: "center",
                }}
              >
                <AntDesign
                  name="left"
                  size={24}
                  color={isAndroid || isWeb ? "#fff" : Colors.primary}
                  onPress={() => setSelectedContainer([])}
                />
                <Text style={styles.title}>{selectedContainer.length}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 20 }}>
                <Ionicons
                  name="checkbox"
                  size={24}
                  onPress={() =>
                    Alert.alert("Are you sure?", "set task as finished?", [
                      { text: "CANCEL", style: "cancel" },
                      {
                        text: "YES",
                        style: "ok",
                        onPress: () => handleCompleteTask(),
                      },
                    ])
                  }
                  color={isAndroid || isWeb ? "#fff" : Colors.primary}
                />
                <Ionicons
                  name="md-share-social-sharp"
                  size={24}
                  onPress={onShare}
                  color={isAndroid || isWeb ? "#fff" : Colors.primary}
                />
                <MaterialCommunityIcons
                  name="delete"
                  size={24}
                  onPress={handleDeleteTask}
                  color={isAndroid || isWeb ? "#fff" : Colors.primary}
                />
              </View>
            </>
          )}
        </View>
        {todoList?.length <= 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../assets/empty.png")}
              style={{ width: 300, height: 300 }}
            />
            <Text style={styles.noTask}> You have no Tasks</Text>
          </View>
        ) : (
          <View style={styles.body}>
            <SectionList
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 10,
                paddingTop: 70,
                paddingBottom: 100,
              }}
              showsVerticalScrollIndicator={false}
              sections={groupedTasks}
              keyExtractor={(item, index) => item.id.toString() + index}
              renderItem={({ item }) => {
                const taskStyle = styles.task;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      taskStyle,
                      {
                        backgroundColor:
                          item.status === "Overdue"
                            ? Colors.inActive
                            : Colors.primary,
                        borderWidth: selectedContainer.includes(item.task)
                          ? 2
                          : 0,
                        borderColor: selectedContainer.includes(item.task)
                          ? "red"
                          : undefined,
                      },
                    ]}
                    onLongPress={() => {
                      if (!selectedContainer.includes(item.task)) {
                        setSelectedContainer((prev) => [...prev, item.task]);
                      }
                    }}
                    onPress={() =>
                      setSelectedContainer((prev) =>
                        prev.filter((list) => list !== item.task)
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        width: "90%",
                      }}
                    >
                      <Checkbox
                        style={styles.checkbox}
                        value={item.completed}
                        onValueChange={setChecked}
                        color={isChecked ? "#4630EB" : undefined}
                      />
                      <View style={{ width: "100%" }}>
                        <Text
                          style={[
                            styles.taskText,
                            {
                              textDecorationLine: item.completed
                                ? "line-through"
                                : "none",
                            },
                          ]}
                        >
                          {item.task}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            width: "100%",
                          }}
                        >
                          <Text
                            style={{
                              flex: 1,
                              color:
                                item.status === "Overdue" ? "#6b0709" : "black",
                            }}
                          >
                            {item.date}
                          </Text>
                          <Text
                            style={{
                              color:
                                item.status === "Overdue" ? "#6b0709" : "black",
                            }}
                          >
                            {item.time}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              renderSectionHeader={({ section: { title, data } }) => {
                if (data.length > 0) {
                  return (
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionHeaderText}>{title}</Text>
                    </View>
                  );
                }
                return null;
              }}
            />
          </View>
        )}
        {isAndroid || isWeb ? (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.fab}
              activeOpacity={0.8}
              onPress={() => {
                if (task.length === 0) {
                  return alert("Please enter a Task to add");
                }
                setModalOpen(true);
              }}
            >
              <Entypo
                name="plus"
                size={isAndroid || isWeb ? 24 : 30}
                color={isAndroid || isWeb ? "#fff" : Colors.primary}
              />
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
        ) : (
          <TouchableOpacity
            style={[styles.fab, { bottom: 40, right: 20 }]}
            activeOpacity={0.8}
            onPress={() => {
              setModalOpen(true);
            }}
          >
            <Entypo
              name="plus"
              size={isAndroid || isWeb ? 24 : 30}
              color={isAndroid || isWeb ? "#fff" : Colors.primary}
            />
          </TouchableOpacity>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalOpen}
          onDismiss={() => setModalOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            onPress={() => setModalOpen(false)}
            activeOpacity={1}
          >
            <TouchableOpacity
              style={styles.modalView}
              onPress={() => {}}
              activeOpacity={1}
            >
              {!isAndroid && !isWeb && (
                <>
                  <Text style={styles.modalTitle}>Task</Text>
                  <TextInput
                    placeholder="Add Task"
                    style={styles.input}
                    value={task}
                    onChangeText={setTasks}
                    multiline
                    autoCapitalize="sentences"
                    autoCorrect
                  />
                </>
              )}
              <Text style={styles.modalTitle}>Due date</Text>

              <View style={styles.dateContainer}>
                <TouchableOpacity
                  style={styles.dateInputContainer}
                  onPress={showDatepicker}
                >
                  <Text>
                    {dayjs(date).calendar(null, {
                      sameDay: "[Today]", // The same day ( Today )
                      nextDay: "[Tomorrow]", // The next day ( Tomorrow )
                      nextWeek: "ddd, D MMMM YYYY", // The next week (Next wed,28 june 2023 )
                      lastDay: "[Yesterday]", // The day before ( Yesterday )
                      lastWeek: "[Last] ddd, D MMMM YYYY", // Last week ( Last Monday,4 june 2023 )
                      sameElse: "ddd, D MMMM YYYY", // Everything else ( Thu,8 july 2023 )
                    })}
                  </Text>
                </TouchableOpacity>
                <View style={styles.iconContainer}>
                  <FontAwesome5
                    name="calendar-alt"
                    size={20}
                    color={Colors.primary}
                    onPress={showDatepicker}
                  />
                  <AntDesign
                    name="closecircle"
                    size={20}
                    color={Colors.primary}
                  />
                </View>
              </View>

              <View style={styles.dateContainer}>
                <TouchableOpacity
                  style={styles.dateInputContainer}
                  onPress={showTimepicker}
                >
                  <Text>{dayjs(date).format("h:mm A")}</Text>
                </TouchableOpacity>
                <View style={styles.iconContainer}>
                  <FontAwesome5
                    name="clock"
                    size={20}
                    color={Colors.primary}
                    onPress={showTimepicker}
                  />
                  <AntDesign
                    name="closecircle"
                    size={20}
                    color={Colors.primary}
                  />
                </View>
              </View>
              {show && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode={mode}
                  is24Hour={false}
                  onChange={onChange}
                />
              )}
              <View style={{ paddingBottom: 15 }}>
                <Text
                  style={{
                    fontSize: 17,
                    color: Colors.primary,
                    fontWeight: "bold",
                  }}
                >
                  Add to List
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingLeft: 10,
                    gap: 20,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: "#000",
                      fontWeight: "600",
                    }}
                    ref={listRef}
                  >
                    {selectedList}
                  </Text>
                  <FontAwesome5
                    name="caret-down"
                    size={24}
                    color={Colors.primary}
                    style={{ padding: 10 }}
                    onPress={() => {
                      setListModalOpen(true);
                    }}
                  />
                  <Entypo
                    name="add-to-list"
                    size={24}
                    color={Colors.primary}
                    style={{ padding: 10 }}
                    onPress={() => {
                      setAddListModelOpen(true);
                    }}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleAddTask}
              >
                <Text style={styles.modalButtonText}>Set</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
        <Modal animationType="slide" transparent={true} visible={listModalOpen}>
          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              width: "40%",
              top: listModalPosition.y,
              left: listModalPosition.x,
              elevation: 1,
              borderWidth: 0.5,
              borderColor: Colors.primary,
            }}
            activeOpacity={1}
            onPress={() => setListModalOpen(false)}
            onLayout={(event) => {
              event.persist();
              listRef.current?.measureInWindow((x, y) => {
                setListModalPosition({ x, y });
              });
            }}
          >
            <ScrollView>
              {list.map((val) => {
                return (
                  <View
                    key={val}
                    style={{
                      backgroundColor:
                        selectedList === val ? Colors.primary : "#fff",
                      padding: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedList(val);
                        setListModalOpen(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={{
                          fontSize: 17,
                          color: selectedList === val ? "#fff" : "#000",
                        }}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={addListModelOpen}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={1}
            onPress={() => setListModalOpen(false)}
          >
            <View
              style={{
                backgroundColor: "#fff",
                width: "80%",
                padding: 15,
                gap: 20,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: Colors.primary,
                  fontWeight: "800",
                  fontSize: 20,
                }}
              >
                New List
              </Text>
              <TextInput
                value={newList}
                onChangeText={setNewList}
                placeholder="Enter List Name"
                style={{
                  borderBottomColor: Colors.primary,
                  borderBottomWidth: 1,
                  padding: 10,
                  fontSize: 17,
                  color: "#000",
                  fontWeight: "400",
                }}
                autoCapitalize="words"
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 20,
                }}
              >
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.primary,
                    padding: 5,
                    borderRadius: 5,
                  }}
                  onPress={() => setAddListModelOpen(false)}
                >
                  <Text
                    style={{
                      color: Colors.primary,
                      fontWeight: "800",
                      fontSize: 15,
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.primary,
                    borderWidth: 1,
                    borderColor: Colors.primary,
                    padding: 5,
                    borderRadius: 5,
                  }}
                  onPress={() => {
                    if (
                      !list.some(
                        (item) => item.toLowerCase() === newList.toLowerCase()
                      )
                    ) {
                      setList((prev) => [...prev, newList]);
                    } else {
                      Toast.show("item already exists", {
                        duration: Toast.durations.SHORT,
                      });
                    }
                    setSelectedList(newList);
                    setAddListModelOpen(false);
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "800",
                      fontSize: 15,
                    }}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
        <Modal animationType="slide" transparent={true} visible={menuListOpen}>
          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              width: "40%",
              top: menuListPosition.y,
              left: menuListPosition.x,
              elevation: 1,
              borderWidth: 0.5,
              borderColor: Colors.primary,
              // marginTop: !isAndroid && isWeb? 50 : undefined,
            }}
            activeOpacity={1}
            onPress={() => setMenuListOpen(false)}
            onLayout={(event) => {
              event.persist();
              menuListRef.current?.measureInWindow((x, y) => {
                setMenuListPosition({ x, y });
              });
            }}
          >
            <ScrollView>
              {list.map((val) => {
                return (
                  <View
                    key={val}
                    style={{
                      backgroundColor:
                        selectedList === val ? Colors.primary : "#fff",
                      padding: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedMenuList(val);
                        setMenuListOpen(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={{
                          fontSize: 17,
                          color: selectedList === val ? "#fff" : "#000",
                        }}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={settingsModelOpen}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#fff",
              width: "40%",
              top: settingsModelPosition.y,
              left: settingsModelPosition.x,
              elevation: 1,
              borderWidth: 0.5,
              borderColor: Colors.primary,
              padding: 15,
            }}
            activeOpacity={1}
            onPress={() => {
              onFetchUpdateAsync();
              setSettingsModelOpen(false);
            }}
          >
            <Text style={{ color: "red" }}>Look For Updates</Text>
          </TouchableOpacity>
        </Modal>
        <StatusBar
          style={!isAndroid || isWeb ? "dark" : "light"}
          backgroundColor={Colors.primary}
        />
      </View>
    </SafeA>
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
    position: "absolute",
    top: 0,
    backgroundColor: Colors.primary,
    width: "100%",
    height: 70,
    padding: 10,
    paddingTop: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 12,
    zIndex: 1,
    ...Platform.select({
      ios: {
        backgroundColor: "#fff",
      },
    }),
  },
  title: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 20,
    ...Platform.select({
      ios: {
        color: Colors.primary,
      },
    }),
  },
  footer: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "transparent",
    width: "100%",
    padding: 20,
    gap: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    backgroundColor: Colors.primary,
    width: "100%",
    padding: 15,
    borderRadius: 15,
    elevation: 3,
    fontWeight: "400",
    fontSize: 17,
    color: "#fff",
    maxHeight: 172,
    zIndex: 1,
    ...Platform.select({
      ios: {
        padding: 0,
        backgroundColor: "transparent",
        borderBottomColor: Colors.primary,
        borderBottomWidth: 2,
        zIndex: 0,
        borderRadius: 0,
        marginVertical: 20,
        color: "#000",
      },
    }),
  },
  searchInput: {
    flex: 1,
    fontWeight: "400",
    fontSize: 17,
    color: "#fff",
  },
  fab: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 200,
    width: 50,
    height: 50,
    padding: 10,
    elevation: 3,
    alignSelf: "flex-end",
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        backgroundColor: "transparent",
      },
    }),
  },
  icon: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "800",
    ...Platform.select({
      ios: {
        color: Colors.primary,
        fontSize: 24,
      },
    }),
  },
  task: {
    flexDirection: "row",
    marginVertical: 2,
    width: "100%",
    padding: 10,
    borderRadius: 15,
    elevation: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
    }),
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

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "#fff",
    width: "90%",
    elevation: 2,
    borderRadius: 12,
    padding: 15,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
    }),
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginVertical: 15,
  },
  dateInputContainer: {
    flex: 1,
    borderBottomColor: Colors.primary,
    borderBottomWidth: 2,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    width: "50%",
    marginTop: 10,
    alignSelf: "center",
    elevation: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
    }),
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
  },
  checkbox: {
    margin: 8,
  },
  sectionHeader: {
    marginTop: 15,
    marginBottom: 5,
  },
  sectionHeaderText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#000",
  },
});
