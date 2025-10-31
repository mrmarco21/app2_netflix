import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from "react-native";

export default function PantallaPruebaTMDB() {
    const [peliculas, setPeliculas] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const obtenerPeliculas = async () => {
            try {
                const respuesta = await fetch("http://192.168.137.1:3000/api/tmdb/peliculas/populares");
                const data = await respuesta.json();

                console.log("📦 Datos recibidos:", data); // 🔍 Debug

                // ✅ CAMBIO IMPORTANTE: Ahora viene en data.results
                setPeliculas(data.results || []);

            } catch (error) {
                console.error("❌ Error al obtener películas:", error);
            } finally {
                setCargando(false);
            }
        };

        obtenerPeliculas();
    }, []);

    if (cargando) {
        return (
            <View style={estilos.cargando}>
                <ActivityIndicator size="large" color="red" />
                <Text style={{ color: "white", marginTop: 10 }}>Cargando películas...</Text>
            </View>
        );
    }

    return (
        <View style={estilos.contenedor}>
            <Text style={estilos.titulo}>🎬 Películas populares (TMDB)</Text>

            <FlatList
                data={peliculas}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={estilos.item}>
                        <Image
                            source={{ uri: item.poster_url }} // ✅ Ya viene con la URL completa
                            style={estilos.poster}
                        />
                        <Text style={estilos.nombre}>{item.title}</Text>
                        {/* <Text style={estilos.rating}>⭐ {item.vote_average?.toFixed(1)}</Text> */}
                    </View>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
            />
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        flex: 1,
        backgroundColor: "black",
        paddingTop: 50,
        paddingHorizontal: 10,
    },
    titulo: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },
    item: {
        marginRight: 10,
        alignItems: "center",
    },
    poster: {
        width: 120,
        height: 180,
        borderRadius: 8,
    },
    nombre: {
        color: "white",
        marginTop: 5,
        width: 120,
        textAlign: "center",
        fontSize: 12,
    },
    rating: {
        color: "#FFD700",
        marginTop: 2,
        fontSize: 11,
    },
    cargando: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
});