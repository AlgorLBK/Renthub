import { initializeApp } from 'firebase/app';
import { FirebaseApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { collection, getFirestore, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import Constants from 'expo-constants';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
// import { firebase } from '@react-native-firebase/firestore';
const firebaseConfig = {
    apiKey: Constants.expoConfig.extra.apiKey,
    authDomain: Constants.expoConfig.extra.authDomain,
    projectId: Constants.expoConfig.extra.projectId,
    storageBucket: Constants.expoConfig.extra.storageBucket,
    messagingSenderId: Constants.expoConfig.extra.messagingSenderId,
    appId: Constants.expoConfig.extra.appId
}

const app = initializeApp(firebaseConfig)
export const database = getFirestore(app);
export const auth = getAuth();
export { FirebaseApp };
export const uid = (auth.currentUser || {}).uid;
export const timestamp = Date.now()

export const addPost = async ({ text, localUri }) => {
    try {
        const remoteUri = await uploadPhotoAsync(localUri);
        const uid = (auth.currentUser || {}).uid;
        const todoRef = collection(database, 'posts');
        const data = {
            id: uid,
            name: auth.currentUser.email,
            text,
            timestamp: Date.now(),
            avatar: auth.currentUser.photoURL,
            image: remoteUri,
            username: auth.currentUser.displayName.split("/")[2],
            likes: []
        };
        await addDoc(todoRef, data);
        console.log("Post added successfully!");
    } catch (error) {
        console.error("Error adding post:", error);
    }
};

// export const findPostId = async (uidFieldName, timestampFieldName, postUid, postTimestamp) => {
//     try {
//         console.log(database)
//         const postRef = firebase.firestore().collection('posts');;
//         await postRef.add({
//             "hi": "how are you ?"
//         });
//         const q = query(postRef, where(uidFieldName, '==', postUid), where(timestampFieldName, '==', postTimestamp));
//         console.log("Query: ", q)
//         const querySnapshot = getDocs(q);
//         let documentId = null;
//         querySnapshot.forEach((doc) => {
//             documentId = doc.id;
//         });
//         console.log("Document id: ", documentId)
//         return documentId;
//     } catch (error) {
//         console.error('Error finding document ID:', error);
//         return null;
//     }
// }

// import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// export const findPostId = async (uidFieldName, timestampFieldName, postUid, postTimestamp) => {
//     try {
//         const db = getFirestore(); // Initialize Firestore

//         // Create a query based on uid and timestamp
//         const q = query(collection(db, 'posts'), 
//             where(uidFieldName, '==', postUid),
//             where(timestampFieldName, '==', postTimestamp)
//         );

//         const querySnapshot = await getDocs(q);
//         let documentId = null;

//         querySnapshot.forEach((doc) => {
//             documentId = doc.id;
//         });

//         console.log("Document id:", documentId);
//         return documentId;
//     } catch (error) {
//         console.error('Error finding document ID:', error);
//         return null;
//     }
// };


const uploadPhotoAsync = async (uri) => {
    const uid = (auth.currentUser || {}).uid;
    const timestamp = Date.now();
    const path = `photos/${uid}/${timestamp}.jpg`;
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