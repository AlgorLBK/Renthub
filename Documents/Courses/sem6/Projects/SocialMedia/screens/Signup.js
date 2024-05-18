import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert, TouchableWithoutFeedback, Keyboard, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";
import * as ImagePicker from 'expo-image-picker';
import firebase from 'firebase/compat/app';
import { getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';

const backImage = require("../assets/backImage.png");

export default function Signup({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);

    const onHandleSignup = async () => {
        try {
            if (email !== "" && password !== "" && firstName !== "" && lastName !== "" && username !== "") {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const remote = await uploadPhotoAsync(profilePicture);
                await updateProfile(user, {
                    displayName: `${firstName.trim()}/${lastName.trim()}/${username.trim()}`,
                    photoURL: remote,
                });
                await storeUserProfileInFirestore(user.uid, remote);
            } else {
                Alert.alert("All fields are required!");
            }
        } catch (err) {
            Alert.alert("Signup error", err.message);
        }
    };

    const uploadPhotoAsync = async (uri) => {
        const uid = (getAuth()["currentUser"] || {})["uid"];
        const timestamp = Date.now();
        const path = `profilePictures/${uid}/${timestamp}.jpg`;
        const storage = getStorage();
        const storageRef = ref(storage, path);

        try {
            const response = await fetch(uri);
            const file = await response.blob();
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading photo:", error);
            throw error;
        }
    };

    const storeUserProfileInFirestore = async (userId, rm) => {
        const userRef = firebase.firestore().collection("users").doc(userId);
        await userRef.set({
            uid: userId,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            username: username.trim(),
            profilePicture: rm,
        });
    };

    const selectProfilePicture = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
        });

        if (!result.canceled) {
            const { uri } = result.assets[0];
            setProfilePicture(uri);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Image source={backImage} style={styles.backImage} />
                <View style={styles.whiteSheet} />
                <SafeAreaView style={{ flex: 1 }}>
                    <Text style={styles.title}>Sign Up</Text>
                    <TouchableOpacity onPress={selectProfilePicture}>
                        {profilePicture ? (
                            <Image
                                source={{ uri: profilePicture }}
                                style={styles.profilePicture}
                            />
                        ) : (
                            <Image
                                source={require("../assets/profile.png")}
                                style={styles.profilePicture}
                            />
                        )}
                    </TouchableOpacity>
                    <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
                        <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            autoFocus={true}
                            autoCapitalize="words"
                            value={firstName}
                            onChangeText={(text) => setFirstName(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            autoCapitalize="words"
                            value={lastName}
                            onChangeText={(text) => setLastName(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            autoCapitalize="none"
                            value={username}
                            onChangeText={(text) => setUsername(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter email"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            textContentType="emailAddress"
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter password"
                            autoCapitalize="none"
                            autoCorrect={false}
                            secureTextEntry={true}
                            textContentType="password"
                            value={password}
                            onChangeText={(text) => setPassword(text)}
                        />
                        <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
                            <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                        <View
                            style={{
                                marginTop: 30,
                                flexDirection: "row",
                                alignItems: "center",
                                alignSelf: "center",
                            }}
                        >
                            <Text style={{ color: "gray", fontWeight: "600", fontSize: 14 }}>
                                Already have an account?
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                <Text style={{ color: "#f57c00", fontWeight: "600", fontSize: 14 }}>
                                    {" "}
                                    Log in
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                    <StatusBar barStyle="light-content" />
                </SafeAreaView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 36,
        fontWeight: "bold",
        color: "orange",
        alignSelf: "center",
        paddingBottom: 24,
        marginTop: 40,
    },
    input: {
        backgroundColor: "#F6F7F8",
        height: 58,
        marginBottom: 20,
        fontSize: 16,
        borderRadius: 10,
        padding: 12,
    },
    backImage: {
        width: "100%",
        height: 340,
        position: "absolute",
        top: 0,
        resizeMode: "cover",
    },
    whiteSheet: {
        width: "100%",
        height: "75%",
        position: "absolute",
        bottom: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
    },
    form: {
        flexGrow: 1,
        justifyContent: "center",
        marginHorizontal: 30,
    },
    button: {
        backgroundColor: '#f57c00',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    profilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 20,
    },
    selectProfilePictureText: {
        fontSize: 16,
        color: '#f57c00',
        textAlign: 'center',
        marginTop: 20,
    },
});
