import React from 'react';
import ReactCookieConsent from 'react-cookie-consent';

export const PrivacyPolicy = () => {
  return (
    <div>
      <h1>Privacy</h1>

      <p>
        We do collect some Personal Data from our Users and the Users of our API
        and SDK at communitymap.online.
      </p>

      <p>
        Your email, display name and photo is taken as part of
        registration/sign-in with Google account. We do it to prevent fraud and
        make the users a bit more accountable to their actions in the platform.
        They are private and accessible only by the administrator of the
        platform. Additional information like nickname, gender and avatar
        picture are public.
      </p>

      <p>
        We use Firebase/Google Analytics and they collect some information about
        your device, browser and IP address. We need Analytics to get a better
        understanding of our users and their actions in the platform - this is
        important for creating a good service.
      </p>

      <p>
        We use Firebase Firestore database for collecting information of your
        posts, comments and reactions - this information is public. We also
        store the direct messages with other users within our platform - they
        are private and only you, the recipient and administrator of the
        platform may have access to it.
      </p>

      <p>
        We’re currently a team of volunteers not having a formal legal
        structure. The best way to get in touch with us is by either joining our
        Slack workspace using{' '}
        <a href="https://join.slack.com/t/opencommunitymap/shared_invite/zt-e7hqo2zo-rbeP~IoF0pPkAEsa0B7lcw">
          this link
        </a>{' '}
        or by creating a public issue in{' '}
        <a href="https://github.com/opencommunitymap/communitymap-ui">
          our github repository
        </a>{' '}
        or by sending us an email to{' '}
        <a href="mailto:info@opencommunitymap.org">info@opencommunitymap.org</a>
        .
      </p>

      <p>
        We understand that the above may not reflect the level of privacy and
        security that you require. In this case you should not yet use the
        platform and check us again in a few months. We’re working constantly to
        improve the platform, its privacy and security.
      </p>

      <h2>Cookies</h2>
      <p>
        Cookies are small pieces of data that are stored on your computer,
        mobile phone or other device. HTML5 Local Storage is a small database
        located inside your browser which web pages can use to store data to
        speed up their processing. We may use these technologies from time to
        time, to help improve your browsing experience.
      </p>
      <p>
        You have the ability, by toggling with your browser settings, to turn
        off our utilisation of cookies. This may, however, mean that sections of
        the Website or Apps are not accessible in the same way or their
        performance is altered.
      </p>
      <p>
        We use Firebase Analytics and Google Maps that need cookies and local
        storage for the purpose of their operation.
      </p>
    </div>
  );
};

export const CookieConsentBanner = () => (
  <ReactCookieConsent cookieName="__ocm_cookie_consent">
    This website or its third-party tools use cookies, which are necessary to
    its functioning. Read more in our{' '}
    <a href={window.location.origin + '/privacy'}>Privacy and Cookie Policy</a>
  </ReactCookieConsent>
);
