import React, { useState, useEffect } from 'react';
import { FirebaseAuthService } from './services/FirebaseAuthService';
import { getAuth, sendEmailVerification } from 'firebase/auth';
import styles from './EmailVerification.module.css';

const EmailVerification: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        await user.reload(); // Refresh the user object
        setIsVerified(user.emailVerified);
      } else {
        setError('No user is currently signed in');
      }
    } catch (err) {
      setError('Failed to check verification status');
    }
  };

  const handleResendVerification = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setError('Verification email resent. Please check your inbox.');
      } else {
        setError('No user is currently signed in');
      }
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Email Verification</h2>
      {isVerified ? (
        <p className={styles.verifiedMessage}>Your email has been verified. You can now use all features of the app.</p>
      ) : (
        <>
          <p className={styles.message}>Your email is not yet verified. Please check your inbox for the verification email.</p>
          <button onClick={handleResendVerification} className={styles.resendButton}>
            Resend Verification Email
          </button>
        </>
      )}
      <button onClick={checkVerificationStatus} className={styles.refreshButton}>
        Refresh Verification Status
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default EmailVerification;