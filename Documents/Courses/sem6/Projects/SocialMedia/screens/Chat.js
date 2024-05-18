// import {Container} from 'native-base';
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import {FlatList, StatusBar, StyleSheet, SafeAreaView} from 'react-native';
import {ListItem, Avatar} from 'react-native-elements';
// import SearchBar from 'react-native-elements/dist/searchbar/SearchBar-ios';
import SearchBar from 'react-native-elements/dist/searchbar/SearchBar-default';
import {COLORS} from '../constants/Color';
import { useNavigation } from '@react-navigation/native';
// import {useSelector} from 'react-redux';
// import Navigation from '../../Service/Navigation';
import uuid from 'react-native-uuid';
import { auth, database } from '../config/firebase';

const Chat = () => {
  // const {userData} = useSelector(state => state.User);
  const navigation = useNavigation()
  const [search, setsearch] = useState('');
  const [allUser, setallUser] = useState([]);
  const [allUserBackup, setallUserBackup] = useState([]);

  useEffect(() => {
    getAllUser();
  }, []);

  const getAllUser = () => {
  getDocs(collection(database, 'users'))
    .then(snapshot => {
      setallUser(
        snapshot.docs.map(doc => doc.data()),
      );
      setallUserBackup(
        snapshot.docs.map(doc => doc.data()),
      );
    })
    .catch(error => {
      console.error('Error getting users: ', error);
    });
  };

  const searchuser = val => {
    setsearch(val);
    setallUser(allUserBackup.filter(it => it.username.match(val)));
  };

  
  const renderItem = ({item}) => (
    <ListItem
      onPress={() => navigation.navigate("SingleChat", { receiverData: item })}
      bottomDivider
      containerStyle={styles.listStyle}>
      <Avatar
        source={{uri: item.profilePicture}}
        rounded
        title={item.username}
        size="medium"
      />
      <ListItem.Content>
        <ListItem.Title style={{fontSize: 14}}>
          {item.firstName + " " + item.lastName}
        </ListItem.Title>
        <ListItem.Subtitle
          style={{fontSize: 12}}
          numberOfLines={1}>
          {item.username}
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORS.white}}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.green} />
      <SearchBar
        placeholder="Search by name..."
        onChangeText={val => searchuser(val)}
        value={search}
        containerStyle={styles.searchContainer}
        inputStyle={styles.searchInput}
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        data={allUser}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
};

export default Chat;

const styles = StyleSheet.create({
  searchContainer: {
    elevation: 2,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
  },
  searchInput: {
    fontSize: 15,
    color: COLORS.black,
    opacity: 0.7,
  },
  listStyle: {paddingVertical: 7, marginVertical: 2},
});