const isServo = typeof navigator !== 'undefined' && /\bservo\b/iu.test(navigator.userAgent);

export { isServo };
