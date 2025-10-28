import React, { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NetflixIntro({ navigation }) {
  const letters = "MI NETFLIX".split("");
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  // animaciones individuales para cada letra
  const letterAnimations = useRef(
    letters.map(() => new Animated.Value(100)) // posición inicial desplazada a la derecha
  ).current;

  useEffect(() => {
    // animación de entrada general
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // animación secuencial de letras (una por una)
    Animated.stagger(
      100, // delay entre letras
      letterAnimations.map((anim) =>
        Animated.timing(anim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        })
      )
    ).start();

    // animación de la barra de progreso
    Animated.timing(progressWidth, {
      toValue: 100,
      duration: 3500,
      useNativeDriver: false,
    }).start();

    // navegación tras 3.5s
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        navigation.replace("Inicio");
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {letters.map((letter, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.logoLetter,
                {
                  transform: [
                    { translateX: letterAnimations[index] },
                    { scale },
                  ],
                  opacity,
                },
              ]}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>

        <Animated.View style={[styles.loadingContainer, { opacity }]}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingProgress,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    flexDirection: "row",
    marginBottom: 40,
  },
  logoLetter: {
    color: "red",
    fontSize: 50,
    fontWeight: "bold",
    letterSpacing: 5,
    textShadowColor: "rgba(255, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  loadingContainer: {
    width: 200,
    alignItems: "center",
  },
  loadingBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    overflow: "hidden",
  },
  loadingProgress: {
    height: "100%",
    backgroundColor: "red",
    borderRadius: 2,
    shadowColor: "red",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});
