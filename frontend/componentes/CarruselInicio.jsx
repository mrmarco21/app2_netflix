// componentes/CarruselInicio.js
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const carouselData = [
  {
    id: 1,
    image: require("../assets/imgFondo1.jpg"),
    title: "Películas y series",
    subtitle: "ilimitadas y mucho más.",
    description:
      "Disfruta donde quieras. Cancela cuando quieras. Toca el enlace de abajo para suscribirte.",
  },
  {
    id: 2,
    image: require("../assets/imgFondo2.jpg"),
    title: "Descarga y ve",
    subtitle: "sin conexión.",
    description:
      "Guarda fácilmente tus favoritos y siempre tendrás algo que ver.",
  },
  {
    id: 3,
    image: require("../assets/imgFondo3.jpg"),
    title: "Sin compromisos.",
    subtitle: "Cancela en línea.",
    description: "Únete hoy, cancela en cualquier momento.",
  },
  {
    id: 4,
    image: require("../assets/imgFondo4.jpg"),
    title: "Ve en cualquier lugar.",
    subtitle: "Cancela en cualquier momento.",
    description:
      "Transmite películas y programas de TV ilimitados en tu teléfono, tableta, laptop y TV.",
  },
];

export default function CarruselInicio() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef();

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index) => {
    scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrentIndex(index);
  };

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {carouselData.map((item) => (
          <View key={item.id} style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image source={item.image} style={styles.slideImage} />
              <LinearGradient
                colors={[
                  "rgba(0,0,0,0.85)",
                  "rgba(3, 70, 106, 0.61)",
                  "rgba(0,0,0,0.85)",
                ]}
                locations={[0, 0.5, 1]}
                style={styles.fullGradient}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
              <Text style={styles.slideDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Puntos de navegación */}
      <View style={styles.pagination}>
        {carouselData.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index && styles.paginationDotActive,
            ]}
            onPress={() => scrollToIndex(index)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    height: "92%",
    position: "relative",
  },
  slide: {
    width: width,
    height: "100%",
    justifyContent: "flex-end",
  },
  imageContainer: {
    position: "absolute",
    // top: 5,
    width: "100%",
    height: "100%",
  },
  slideImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  fullGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  textContainer: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  slideTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  slideSubtitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "500",
  },
  slideDescription: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
    opacity: 0.8,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#555",
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: "red",
  },
});
