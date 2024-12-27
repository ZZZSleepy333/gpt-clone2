export const useSendMessage = () => {
  const newMessage = ref("");
  const isLoading = ref(false);
  const messages = useState("messages", () => [
    {
      userMessage: "",
      botMessage: {
        title: "",
        link: "",
        snippet: "Xin chào, tôi có thể giúp gì được cho bạn",
      },
    },
  ]);
  // let responseList = [];

  const sendMessage = (userMessage, botMessage) => {
    messages.value.push({ userMessage: userMessage, botMessage: botMessage });

    newMessage.value = "";
  };

  // const respondFormatter = (searchString, searchData) => {
  //   const defaultValues = {
  //     Player: "Không có",
  //     ErrCode: "Không có",
  //     ErrMessage: "Không có",
  //     Cause: "Không có",
  //     CustomerSolution: "Không có",
  //     DeveloperSolution: "Không có",
  //     Note: "Không có",
  //   };

  //   if (searchData.length > 0) {
  //     const item = searchData;

  //     Object.keys(defaultValues).forEach((key) => {
  //       if (item[key] === undefined || item[key] === "") {
  //         item[key] = defaultValues[key];
  //       }
  //     });
  //     for (let i = 0; i < searchData.length; i++) {
  //       const resString = `Player: ${searchData[i].Player}\nMã lỗi: ${searchData[i].ErrCode}\nThông báo lỗi: ${searchData[i].ErrMessage}\nNguyên nhân:\n${searchData[i].Cause}\nHướng gi���i quyết cho khách hàng:\n${searchData[i].CustomerSolution}\nĐội xử lý:\n${searchData[i].DeveloperSolution}\nGhi chú thêm:\n${searchData[i].Note}`;

  //       responseList.push(resString);
  //     }

  //     sendMessage(searchString, responseList);

  //     responseList = [];
  //   } else {
  //     sendMessage(searchString, "Sorry, I don't understand the question.");
  //   }
  // };

  return { sendMessage, newMessage, messages, isLoading };
};
