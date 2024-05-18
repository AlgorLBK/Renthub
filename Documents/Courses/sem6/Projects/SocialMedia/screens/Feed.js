import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import Lightbox from 'react-native-lightbox';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { database } from '../config/firebase';
import { collection, getDocs, query, where, doc, updateDoc, increment, arrayRemove, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// const findPostId = async (postUid, postTimestamp) => {
//     try {
//         const postRef = collection(database, 'posts');
//         const q = query(postRef, where("id", '==', postUid), where("timestamp", '==', postTimestamp));
//         const querySnapshot = await getDocs(q);
//         let documentId = null;
//         querySnapshot.forEach((doc) => {
//             documentId = doc.id;
//         });
//         return documentId;
//     } catch (error) {
//         console.error('Error finding document ID:', error);
//         return null;
//     }
// };

const incrementLikes = async (documentId, array) => {
    console.log(getAuth())
    try {
        const documentRef = doc(database, "posts", documentId);
        await updateDoc(documentRef, {
            likes: array(getAuth()["currentUser"]["uid"])
        });
        console.log("Likes incremented successfully");
    } catch (error) {
        console.error("Error incrementing likes: ", error);
    }
};

const Post = ({ post, onToggleLike, isLiked, likeCount }) => {
    return (
        <View style={styles.feedItem}>
            <Image source={{ uri: post.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View>
                        <Text style={styles.name}>{post.username}</Text>
                        <Text style={styles.timestamp}>{moment(post.timestamp).fromNow()}</Text>
                    </View>
                    <MaterialCommunityIcons name="dots-horizontal" color="#73788B" size={24} />
                </View>
                <Text style={styles.post}>{post.text}</Text>
                <Lightbox springConfig={{ tension: 15, friction: 7 }} swipeToDismiss={true} useNativeDriver={true}>
                    <Image source={{ uri: post.image }} style={styles.postImage} />
                </Lightbox>
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity onPress={onToggleLike}>
                        <MaterialCommunityIcons
                            name={isLiked ? 'heart' : 'heart-outline'}
                            color={isLiked ? 'red' : '#73788B'}
                            size={30}
                            style={{ marginRight: 16 }}
                        />
                    </TouchableOpacity>
                    <MaterialCommunityIcons name="chat-plus-outline" color="#73788B" size={30} />
                </View>
                <View>
                    <Text>{likeCount} likes</Text>
                </View>
            </View>
        </View>
    );
};

export default function Feed({ navigation }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const isFocused = useIsFocused();

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const snapshot = await getDocs(collection(database, "posts"));
            const fetchedPosts = snapshot.docs.map((doc) => {
                const data = doc.data();
                const isLiked = data.likes.includes(getAuth()["currentUser"]["uid"]);
                return {
                    ...data,
                    id: doc.id,
                    isLiked: isLiked,
                    likeCount: data.likes.length
                };
            });
            setPosts(fetchedPosts);
        } catch (error) {
            console.error('Error fetching posts: ', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleLike = async (postId, isLiked, postUid, postTimestamp) => {
        const newPosts = posts.map((post) => {
            if (post.id === postId) {
                const newLikeCount = isLiked ? post.likeCount - 1 : post.likeCount + 1;
                const newIsLiked = !isLiked;
                return { ...post, likeCount: newLikeCount, isLiked: newIsLiked };
            }
            return post;
        });
        setPosts(newPosts);

        try {
            // const id = await findPostId(postUid, postTimestamp);
            if (postUid) {
                await incrementLikes(postUid, isLiked ? arrayRemove : arrayUnion);
            } else {
                // console.log(postUid)
                // console.log(postTimestamp)
                console.error("Post ID not found");
            }
        } catch (error) {
            console.error("Error toggling like: ", error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchPosts();
        });

        return unsubscribe;
    }, [navigation]);

    const { top } = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: "#EFECF4", paddingTop: top }}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Feed</Text>
                <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
                    <MaterialCommunityIcons
                        name="send-circle"
                        color="#73788B"
                        size={30}
                        style={{ alignSelf: 'flex-end' }}
                    />
                </TouchableOpacity>
            </View>

            <FlatList
                style={styles.feed}
                data={posts}
                renderItem={({ item }) => (
                    <Post
                        post={item}
                        isLiked={item.isLiked}
                        likeCount={item.likeCount}
                        onToggleLike={() => toggleLike(item.id, item.isLiked, item.id, item.timestamp)}
                    />
                )}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EFECF4"
    },
    header: {
        flexDirection: 'row',
        paddingBottom: 16,
        paddingLeft: 7,
        paddingRight: 7,
        alignItems: "center",
        zIndex: 10
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        marginLeft: 30,
        fontSize: 20,
        fontWeight: "500"
    },
    feedItem: {
        backgroundColor: "#fff",
        borderRadius: 5,
        padding: 8,
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#EFECF4"
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 16
    },
    name: {
        fontSize: 15,
        fontWeight: "500",
        color: "#454D65"
    },
    timestamp: {
        fontSize: 11,
        color: "#C4C6CE",
        marginTop: 4
    },
    post: {
        marginTop: 16,
        fontSize: 14,
        color: "#838899"
    },
    postImage: {
        width: undefined,
        minHeight: 250,
        resizeMode: 'cover',
        borderRadius: 5,
        marginVertical: 16
    }
});
