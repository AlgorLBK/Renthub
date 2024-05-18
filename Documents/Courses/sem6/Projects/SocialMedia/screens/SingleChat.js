import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback
} from 'react';
import { TouchableOpacity, Text, StyleSheet, View, SafeAreaView } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  where,
  doc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

export default function SingleChat({ route }) {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isTyping, setIsTyping] = useState(false);
  const onSignOut = () => {
    signOut(auth).catch(error => console.log('Error logging out: ', error));
  };

  const room = [auth.currentUser.uid, route.params.receiverData.uid].sort().join("-")

  useLayoutEffect(() => {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={{
              marginRight: 10,
              backgroundColor: "red",
              padding: 5
            }}
            onPress={onSignOut}
          >
            <MaterialCommunityIcons name="cogs" color={"white"} size={24} />
          </TouchableOpacity>
        )
      });
  }, [navigation]);
  
  useLayoutEffect(() => {
    const collectionRef = collection(database, "chats", "messages", room)
    const q = query(collectionRef);
    const unsubscribe = onSnapshot(q, querySnapshot => {
      setMessages(
        querySnapshot.docs.map(doc => ({
          _id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user
        }))
      );
      // console.log(querySnapshot)
    });

  return unsubscribe;
  }, []);

  const onInputTextChanged = useCallback((text) => {
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
    }
  }, [isTyping]);

   const onSend = useCallback((messages = []) => {
        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, messages)
        );
        // setMessages([...messages, ...messages]);
        const { _id, createdAt, text, user } = messages[0];    
        addDoc(collection(database, "chats", "messages", room), {
          _id,
          createdAt,
          text,
          user
        });
      }, []);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                  <MaterialCommunityIcons name="chevron-left" size={30} color="#D8D9D8"></MaterialCommunityIcons>
              </TouchableOpacity>
              <Image source={route.params.receiverData.profilePicture} style={styles.avatar} />
          <Text style={{fontSize: 22, textTransform: 'capitalize', marginLeft: 10}}>{route.params.receiverData.username}</Text>
        </View>
        <GiftedChat
          messages={messages.sort((a, b) => b.createdAt - a.createdAt)}
          showAvatarForEveryMessage={false}
          showUserAvatar={false}
          onSend={messages => onSend(messages)}
          renderAvatar={() => null}
          messagesContainerStyle={{
            backgroundColor: '#fff'
          }}
          // isTyping={isTyping}
          onInputTextChanged={text => onInputTextChanged(text)}
          textInputStyle={{
            backgroundColor: '#fff',
            borderRadius: 20,
          }}
          user={{
            _id: auth?.currentUser?.email,
            avatar: auth?.currentUser?.photoURL
          }}
        />
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        flexDirection: "row",
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#D8D9D8",
        alignItems: 'center',
    },
    inputContainer: {
        margin: 32,
        flexDirection: "row"
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 24,
        marginLeft: 7,
    },
})
