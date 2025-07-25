import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  reload
} from "firebase/auth";
import { auth } from "../firebase";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isEmailVerified: boolean;
  resendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Rate limiting helper
const rateLimiter = {
  attempts: new Map<string, { count: number; timestamp: number }>(),
  
  canAttempt(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt || now - attempt.timestamp > windowMs) {
      this.attempts.set(key, { count: 1, timestamp: now });
      return true;
    }
    
    if (attempt.count >= maxAttempts) {
      return false;
    }
    
    attempt.count++;
    return true;
  },
  
  reset(key: string) {
    this.attempts.delete(key);
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Always reload user to get latest emailVerified status
        await reload(user);
        setCurrentUser(user);
        setIsEmailVerified(user.emailVerified);
      } else {
        setCurrentUser(null);
        setIsEmailVerified(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Validate UWaterloo email - STRICT enforcement
  const validateUWEmail = (email: string): boolean => {
    const uwEmailRegex = /^[a-zA-Z0-9._%+-]+@uwaterloo\.ca$/i;
    return uwEmailRegex.test(email.trim().toLowerCase());
  };

  // Simplified password validation - just check length
  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 6) {
      return { valid: false, message: "Password must be at least 6 characters long" };
    }
    return { valid: true, message: "" };
  };

  const signup = async (email: string, password: string) => {
    // Rate limiting
    if (!rateLimiter.canAttempt(`signup_${email}`)) {
      throw new Error("Too many signup attempts. Please try again later.");
    }

    // Clean email input
    const cleanEmail = email.trim().toLowerCase();

    // STRICT: Validate UWaterloo email domain
    if (!validateUWEmail(cleanEmail)) {
      throw new Error("Only @uwaterloo.ca email addresses are allowed. Please use your UWaterloo email.");
    }

    // Validate password length
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      
      // Send verification email with custom settings
      await sendEmailVerification(userCredential.user, {
        url: `${window.location.origin}/verify-email`, // Redirect to verify page after clicking email link
        handleCodeInApp: false
      });

      // IMPORTANT: Sign out immediately after signup to enforce email verification
      await signOut(auth);
      
      rateLimiter.reset(`signup_${cleanEmail}`);
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("This UWaterloo email is already registered. Please sign in instead.");
      } else if (error.code === 'auth/weak-password') {
        throw new Error("Password is too weak. Please use a stronger password.");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("Invalid email format. Please use your @uwaterloo.ca email.");
      } else {
        throw new Error(error.message || "Failed to create account");
      }
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    // Rate limiting
    const cleanEmail = email.trim().toLowerCase();
    if (!rateLimiter.canAttempt(`login_${cleanEmail}`)) {
      throw new Error("Too many login attempts. Please try again later.");
    }

    // Basic validation
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Validate UWaterloo email domain
    if (!validateUWEmail(cleanEmail)) {
      throw new Error("Only @uwaterloo.ca email addresses are allowed");
    }

    try {
      // Set persistence based on remember me option
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      // Sign in
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      
      // Reload user to ensure we have the latest emailVerified status
      await reload(userCredential.user);
      
      // STRICT: Check if email is verified
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error("Please verify your email before logging in. Check your inbox for the verification link.");
      }
      
      // Double-check UWaterloo domain (security layer)
      if (!validateUWEmail(userCredential.user.email || "")) {
        await signOut(auth);
        throw new Error("Access restricted to verified UWaterloo students only");
      }
      
      rateLimiter.reset(`login_${cleanEmail}`);
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found') {
        throw new Error("No account found with this UWaterloo email. Please sign up first.");
      } else if (error.code === 'auth/wrong-password') {
        throw new Error("Incorrect password. Please try again.");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("Invalid email format. Please use your @uwaterloo.ca email.");
      } else if (error.code === 'auth/user-disabled') {
        throw new Error("This account has been disabled. Please contact support.");
      } else if (error.code === 'auth/invalid-credential') {
        throw new Error("Invalid credentials. Please check your email and password.");
      } else if (error.message) {
        throw error; // Re-throw our custom errors
      } else {
        throw new Error("Failed to sign in. Please try again.");
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error("Failed to log out");
    }
  };

  const resendVerificationEmail = async () => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }
    
    // Rate limiting for resending emails (stricter)
    if (!rateLimiter.canAttempt(`resend_${currentUser.email}`, 2, 60 * 60 * 1000)) {
      throw new Error("Too many verification email requests. Please try again in an hour.");
    }

    try {
      await sendEmailVerification(currentUser, {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: false
      });
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        throw new Error("Too many requests. Please wait before requesting another verification email.");
      }
      throw new Error("Failed to send verification email. Please try again later.");
    }
  };

  const checkEmailVerification = async (): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }

    try {
      // Reload user to get the latest email verification status
      await reload(currentUser);
      const isVerified = currentUser.emailVerified;
      setIsEmailVerified(isVerified);
      return isVerified;
    } catch (error) {
      console.error("Error checking email verification:", error);
      return false;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    isEmailVerified,
    resendVerificationEmail,
    checkEmailVerification
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};