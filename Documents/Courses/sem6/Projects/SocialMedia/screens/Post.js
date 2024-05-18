import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, TextInput, TouchableWithoutFeedback, Keyboard, ImageBackground } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Constants } from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
// import * as ImageCropPicker from 'react-native-image-crop-picker';
import { addPost, firebase } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from "firebase/auth";

export default function Post() {
    const navigation = useNavigation();
    const [imageURI, setImageURI] = React.useState(null);
    const [caption, setCaption] = React.useState('');
    const [imageAspectRatio, setImageAspectRatio] = React.useState(4 / 3);

    
    useEffect(() => {
        getPhotoPermission();
    }, []);

    const getPhotoPermission = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.requestMediaLibraryPermissionsAsync(Permissions.MEDIA_LIBRARY)
            if (status != "granted") {
                alert("You need to enable access to photos!");
            }
        }
    }

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    }

    const handlePost = () => {
        try {console.log("Posting:", { text: caption.trim(), localUri: imageURI });
        addPost({ text: caption.trim(), localUri: imageURI }).then(ref => {
            console.log("Post added successfully:", ref);
            setCaption("")
            setImageURI(null)
            navigation.navigate('Feed')
        }).catch(error => {
            console.error("Error adding post:", error);
            alert(error);
        })
    } catch (error) {
        console.error("Error adding post:", error.message);
        alert("Failed to add post. Please try again.");
    }
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false

        })

        if (!result.canceled) {
            const { uri } = result.assets[0];

            Image.getSize(uri, (width, height) => {
            const aspectRatio = width / height;
            setImageAspectRatio(aspectRatio);
            setImageURI(uri);
        });
        }
    }
    return (
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.container}>
          <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                  <MaterialCommunityIcons name="arrow-left" size={24} color="#D8D9D8"></MaterialCommunityIcons>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePost}>
                  <Text style={{fontWeight: "500"}}>Post</Text>
              </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
              <Image source={{ uri: getAuth()["currentUser"]["photoURL"] }} style={styles.avatar}></Image>
              <TextInput autoFocus={true} multiline={true} numberOfLines={4} style={{flex: 1}} placeholder='Want to share something ?' onChangeText={caption => setCaption(caption)} value={caption}></TextInput>
          </View>

          <TouchableOpacity style={styles.photo} onPress={pickImage}>
              <MaterialCommunityIcons name="camera-plus" size={32} color="#D8D9D8"></MaterialCommunityIcons>
          </TouchableOpacity>
          <View style={{marginHorizontal: 32, marginTop: 32, height: 150}}>
                    {/* <Image source={{ uri: imageURI }} style={{ width: "100%", aspectRatio: imageAspectRatio }}></Image> */}
                    {imageURI && <Image source={{ uri: imageURI }} style={{ width: "100%", aspectRatio: imageAspectRatio }} />}
          </View>
    </SafeAreaView>
        </TouchableWithoutFeedback>
    // <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //   <Text>Settings!</Text>
    // </View>        
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#D8D9D8"
    },
    inputContainer: {
        margin: 32,
        flexDirection: "row"
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16
    },
    photo: {
        alignItems: "flex-end",
        marginHorizontal: 32
    }
})