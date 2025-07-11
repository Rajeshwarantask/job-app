import { useEffect } from 'react';

export const AuthCallback = () => {
  useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');

  const returnPath = localStorage.getItem('gmail_auth_return_url') || '/inbox';

  if (window.opener && (code || error)) {
    // popup-based flow
    window.opener.postMessage(
      code
        ? { type: 'GMAIL_OAUTH_SUCCESS', code }
        : { type: 'GMAIL_OAUTH_ERROR', error },
      window.location.origin
    );
    window.close();
  } else if (code || error) {
    // redirect fallback (no popup)
    window.localStorage.setItem(
      'gmail_oauth_result',
      JSON.stringify(code
        ? { type: 'GMAIL_OAUTH_SUCCESS', code }
        : { type: 'GMAIL_OAUTH_ERROR', error })
    );
    window.location.href = returnPath;
  } else {
    console.error('No opener and no code or error found.');
  }
}, []);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Completing Gmail Login...</h1>
        <p>Please wait or close this window if nothing happens.</p>
      </div>
    </div>
  );
};
