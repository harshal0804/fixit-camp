import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";

const SignUpScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    setEmailError("");

    if (!username || !email || !password || !phoneNumber || !aadharNumber) {
      alert("Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    const result = await register({
      username,
      email,
      password,
      phoneNumber,
      aadharNumber,
      role: "user",
    });

    if (result.success) {
      navigation.navigate("SignIn");
    } else {
      alert(result.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.SignUpScreen}>
        <Image
          source={require("../assets/sign.png")}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
      <Text style={styles.title}>Sign Up ✅</Text>
      <Text style={styles.text}>Let's create your account!</Text>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.usernameHeader}>Username</Text>
          <TextInput
            style={styles.nameinput}
            placeholder="Avoid using your real name."
            keyboardType="name-phone-pad"
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <Text style={styles.phoneHeader}>Phone Number</Text>
          <TextInput
            style={styles.phoneInput}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <Text style={styles.aadHeader}>Roll Number</Text>
          <TextInput
            style={styles.aadInput}
            placeholder="Enter your Roll number"
            keyboardType="numeric"
            maxLength={12} // Restrict input to 12 digits
            value={aadharNumber} // Assume you have state for aadharNumber
            onChangeText={setAadharNumber} // Assume setAadharNumber updates the state
          />

          <Text style={styles.emailHeader}>Email</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="Enter your email"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError("");
            }}
            autoCapitalize="none"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
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
              top: 710,
            }}
          ></View>
          <View style={styles.noAccount}>
            <Text>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate("SignIn")}>
              <Text style={styles.regiText}>Sign In</Text>
            </Pressable>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    zIndex: 1,
    top: 180,
    paddingRight: 200,
  },

  text: {
    fontSize: 16,
    color: "#FFFF",
    position: "absolute",
    zIndex: 1,
    top: 230,
    paddingRight: 170,
    paddingLeft: 10,
  },

  SignUpScreen: {
    width: "100%",
    height: 260,
    top: 0,
    position: "absolute",
    zIndex: 1,
  },

  scrollContainer: {
    paddingTop: 260, // Offset the start of the content
    alignItems: "center",
    justifyContent: "center",
    position: "static",
    zIndex: 0,
    paddingBottom: 30,
  },

  formContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  usernameHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    paddingRight: 225,
  },

  nameinput: {
    width: 340,
    height: 70,
    margin: 8,
    borderWidth: 1,
    padding: 20,
    borderRadius: 18,
  },

  phoneHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    paddingRight: 172,
  },

  phoneInput: {
    width: 340,
    height: 70,
    margin: 8,
    borderWidth: 1,
    padding: 20,
    borderRadius: 18,
  },

  aadHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    paddingRight: 160,
  },

  aadInput: {
    width: 340,
    height: 70,
    margin: 8,
    borderWidth: 1,
    padding: 20,
    borderRadius: 18,
  },

  emailHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    paddingRight: 275,
  },

  input: {
    width: 340,
    height: 70,
    margin: 8,
    borderWidth: 1,
    padding: 20,
    borderRadius: 18,
  },

  passHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    paddingRight: 230,
  },

  passInput: {
    width: 340,
    height: 70,
    margin: 12,
    borderWidth: 1,
    padding: 20,
    borderRadius: 18,
  },

  regiText: {
    color: "#235DFF",
    textDecorationLine: "underline",
  },

  noAccount: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    paddingTop: 10,
  },

  button: {
    backgroundColor: "#235DFF",
    padding: 20,
    borderRadius: 18,
    width: 200,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});

export default SignUpScreen;
