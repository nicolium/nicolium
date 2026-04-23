const copy = (text: string, onSuccess?: () => void, ref?: HTMLInputElement | null) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);

    if (onSuccess) {
      onSuccess();
    }
  } else {
    try {
      if (!ref) {
        const textarea = document.createElement('textarea');

        textarea.textContent = text;
        textarea.style.position = 'fixed';

        document.body.appendChild(textarea);

        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      } else {
        ref.select();
        document.execCommand('copy');
      }
    } catch {
      // Do nothing
    } finally {
      if (onSuccess) {
        onSuccess();
      }
    }
  }
};

export { copy as default };
