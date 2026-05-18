"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

// Google Auth Provider instance
const googleProvider = new GoogleAuthProvider();

// Initialize the AuthContext
const AuthContext = createContext({
  user: null,
  loading: true,
  signUpWithEmail: async () => {},
  loginWithEmail: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Option: You can pull additional user meta from Firestore here if needed
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Registers a user with Email and Password.
   * Also automatically creates a corresponding document in Firestore's 'users' collection.
   * @param {string} email
   * @param {string} password
   * @param {string} displayName Optional display name for the user
   */
  const signUpWithEmail = async (email, password, displayName = "") => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const registeredUser = userCredential.user;

      // Update the user's display name in Firebase Auth
      if (displayName) {
        await updateProfile(registeredUser, { displayName });
      }

      // Initialize the user's document in Firestore (for user profile and dashboard tracking)
      const userRef = doc(db, "users", registeredUser.uid);
      await setDoc(userRef, {
        uid: registeredUser.uid,
        email: registeredUser.email,
        displayName: displayName || null,
        createdAt: new Date().toISOString(),
        role: "user",
      }, { merge: true });

      return userCredential;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  /**
   * Logs in a user with Email and Password.
   * @param {string} email
   * @param {string} password
   */
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  /**
   * Signs in (or registers) a user with their Google account via a popup.
   * Automatically creates/merges a Firestore user profile on first sign-in.
   */
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      // Create or merge user document in Firestore
      const userRef = doc(db, "users", googleUser.uid);
      await setDoc(userRef, {
        uid: googleUser.uid,
        email: googleUser.email,
        displayName: googleUser.displayName || null,
        photoURL: googleUser.photoURL || null,
        createdAt: new Date().toISOString(),
        role: "user",
      }, { merge: true });

      return result;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logs out the currently authenticated user.
   */
  const logout = async () => {
    setLoading(true);
    try {
      return await signOut(auth);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUpWithEmail,
        loginWithEmail,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the AuthContext within client components
export const useAuth = () => useContext(AuthContext);
