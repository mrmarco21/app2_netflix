import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, BackHandler } from "react-native";
import CarruselInicio from "../componentes/CarruselInicio";
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function Inicio({ navigation }) {
    // Controla el botón de atrás del dispositivo
    useEffect(() => {
        const backAction = () => {
            BackHandler.exitApp(); // Sale de la app
            return true; // Previene el comportamiento por defecto
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove(); // Limpia el listener al desmontar
    }, []);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <LinearGradient
                colors={['#d6d6d6ff', '#1a1a1a', '#000000']}
                style={styles.gradient}
            >
                <View style={styles.container}>
                    <CarruselInicio />

                    <View style={styles.header}>
                        <Text style={styles.logo}>MiNetflix</Text>

                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.languageButton}>
                                <Text style={styles.languageText}>Español</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={() => navigation.navigate("Login")}
                            >
                                <Text style={styles.loginText}>Iniciar sesión</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.mainButton}
                        onPress={() => navigation.navigate("Registro")}
                    >
                        <Text style={styles.mainButtonText}>Comienza ya</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#d6d6d6ff',
    },
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        position: "absolute",
        top: 20,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        alignItems: "center",
    },
    logo: {
        color: "red",
        fontSize: 26,
        fontWeight: "bold"
    },
    headerRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 25
    },
    languageButton: {
        marginLeft: 15
    },
    languageText: {
        color: "white"
    },
    loginButton: {
        backgroundColor: "red",
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    loginText: {
        color: "white"
    },
    mainButton: {
        backgroundColor: "red",
        paddingVertical: 12,
        marginHorizontal: 30,
        borderRadius: 6,
        position: "absolute",
        bottom: 15,
        left: 0,
        right: 0,
    },
    mainButtonText: {
        color: "white",
        fontSize: 18,
        textAlign: "center",
    },
});