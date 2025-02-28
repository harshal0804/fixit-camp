import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useAuth } from "../context/AuthContext";

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }

    const result = await login({
      email,
      password,
    });

    if (result.success) {
      navigation.replace("BottomTabs");
    } else {
      alert(result.message || "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.SignInScreen}>
        <Image
          source={require("../assets/sign.png")}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
      <Text style={styles.title}>Welcome 👋 </Text>
      <Text style={styles.text}>Let's Get You Started With Fixit Camp</Text>
      <Text style={styles.emailHeader}>Email</Text>
      <TextInput
        style={[
          styles.input,
          email && !validateEmail(email) && styles.inputError
        ]}
        placeholder="Enter your email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      {email && !validateEmail(email) && (
        <Text style={styles.errorText}>Please enter a valid email address</Text>
      )}
      <Text style={styles.passHeader}>Password</Text>
      <TextInput
        style={styles.passInput}
        placeholder="Enter your password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <View
        style={{
          height: 2,
          width: "100%",
          position: "absolute",
          backgroundColor: "#EEEEEE",
          top: 530,
        }}
      ></View>
      <View style={styles.noAccount}>
        <Text>Don't have an account? </Text>
        <Pressable onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.regiText}> Register Now</Text>
        </Pressable>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFF",
    position: "absolute",
    top: 180,
    paddingRight: 180,
  },

  text: {
    fontSize: 16,
    color: "#FFFF",
    position: "absolute",
    top: 230,
    paddingRight: 80,
    paddingLeft: 10,
  },

  SignInScreen: {
    width: "100%",
    height: 260,
    top: 0,
    position: "absolute",
  },

  input: {
    width: 340,
    height: 70,
    margin: 8,
    borderWidth: 1,
    padding: 20,
    borderRadius: 18,
    position: "absolute",
    top: 310,
  },

  emailHeader: {
    fontSize: 24,
    fontWeight: "bold",
    position: "absolute",
    top: 280,
    paddingRight: 270,
  },

  passHeader: {
    fontSize: 24,
    fontWeight: "bold",
    position: "absolute",
    top: 400,
    paddingRight: 230,
  },

  passInput: {
    width: 340,
    height: 70,
    margin: 12,
    borderWidth: 1,
    padding: 20,
    borderRadius: 18,
    position: "absolute",
    top: 430,
  },

  regiText: {
    color: "#235DFF",
    textDecorationLine: "underline",
    top: -20,
    paddingLeft: 150,
  },

  noAccount: {
    position: "absolute",
    top: 550,
  },

  button: {
    backgroundColor: "#235DFF",
    padding: 20,
    borderRadius: 18,
    position: "absolute",
    top: 600,
    width: 200,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },

  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    position: 'absolute',
    top: 370,
    left: 30,
  },
});

export default SignInScreen;
