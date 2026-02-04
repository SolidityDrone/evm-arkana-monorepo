'use client';

import { AppKitButton } from '@reown/appkit/react';
import { useEffect } from 'react';

export default function AppKitButtonWrapper() {
  useEffect(() => {
    // Inject styles directly into the document to override AppKit's Shadow DOM styles
    const styleId = 'appkit-custom-styles';
    if (document.getElementById(styleId)) {
      return;
    }

    // Use MutationObserver to apply styles after AppKit components are rendered
    const applyStylesToShadowDOM = () => {
      const appkitElements = document.querySelectorAll('appkit-button, w3m-button, appkit-account-button, w3m-account-button');
      appkitElements.forEach((element) => {
        const shadowRoot = (element as any).shadowRoot;
        if (shadowRoot) {
          // Try to inject styles into shadow DOM
          if (!shadowRoot.querySelector('style[data-appkit-custom]')) {
            const style = document.createElement('style');
            style.setAttribute('data-appkit-custom', 'true');
            style.textContent = `
              :host {
                --wui-color-fg-100: #e8e4f0 !important;
                --wui-color-fg-200: #e8e4f0 !important;
                --wui-color-fg-300: #9a9ab0 !important;
                --wui-color-bg-100: #2a2a42 !important;
                --wui-color-bg-200: #343450 !important;
                --wui-color-bg-300: #343450 !important;
                --wui-color-accent-100: #a855f7 !important;
                --wui-color-accent-090: rgba(168, 85, 247, 0.9) !important;
                --wui-border-radius-3xs: 0.25rem !important;
                --wui-border-radius-2xs: 0.25rem !important;
                --wui-border-radius-xs: 0.25rem !important;
                --wui-border-radius-s: 0.25rem !important;
                --wui-border-radius-m: 0.25rem !important;
                --wui-border-radius-l: 0.25rem !important;
                --wui-font-family: 'VT323', 'Geist Mono', monospace !important;
              }
              button, wui-button, [role="button"] {
                font-family: 'VT323', 'Geist Mono', monospace !important;
                font-size: 0.75rem !important;
                text-transform: uppercase !important;
                letter-spacing: 0.05em !important;
                border: 1px solid #585878 !important;
                background: transparent !important;
                color: #e8e4f0 !important;
                border-radius: 0.25rem !important;
                padding: 0.5rem 1rem !important;
                transition: all 0.3s ease !important;
              }
              button:hover, wui-button:hover, [role="button"]:hover {
                border-color: #a855f7 !important;
                background: rgba(168, 85, 247, 0.1) !important;
                color: #a855f7 !important;
              }
            `;
            shadowRoot.appendChild(style);
          }
        }
      });
    };

    const observer = new MutationObserver(() => {
      applyStylesToShadowDOM();
    });

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Force styles on AppKit web components */
      appkit-button,
      w3m-button,
      appkit-account-button,
      w3m-account-button {
        --wui-color-fg-100: #e8e4f0 !important;
        --wui-color-fg-200: #e8e4f0 !important;
        --wui-color-fg-300: #9a9ab0 !important;
        --wui-color-bg-100: #2a2a42 !important;
        --wui-color-bg-200: #343450 !important;
        --wui-color-bg-300: #343450 !important;
        --wui-color-accent-100: #a855f7 !important;
        --wui-color-accent-090: rgba(168, 85, 247, 0.9) !important;
        --wui-border-radius-3xs: 0.25rem !important;
        --wui-border-radius-2xs: 0.25rem !important;
        --wui-border-radius-xs: 0.25rem !important;
        --wui-border-radius-s: 0.25rem !important;
        --wui-border-radius-m: 0.25rem !important;
        --wui-border-radius-l: 0.25rem !important;
        --wui-font-family: 'VT323', 'Geist Mono', monospace !important;
        font-family: 'VT323', 'Geist Mono', monospace !important;
      }

      /* Target all nested elements */
      appkit-button *,
      w3m-button *,
      appkit-account-button *,
      w3m-account-button * {
        font-family: 'VT323', 'Geist Mono', monospace !important;
      }

      /* Style buttons inside AppKit components */
      appkit-button button,
      w3m-button button,
      appkit-account-button button,
      w3m-account-button button,
      appkit-button wui-button,
      w3m-button wui-button,
      appkit-account-button wui-button,
      w3m-account-button wui-button {
        font-family: 'VT323', 'Geist Mono', monospace !important;
        font-size: 0.75rem !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        border: 1px solid #585878 !important;
        background: transparent !important;
        color: #e8e4f0 !important;
        border-radius: 0.25rem !important;
        padding: 0.5rem 1rem !important;
        transition: all 0.3s ease !important;
      }

      appkit-button button:hover,
      w3m-button button:hover,
      appkit-account-button button:hover,
      w3m-account-button button:hover,
      appkit-button wui-button:hover,
      w3m-button wui-button:hover,
      appkit-account-button wui-button:hover,
      w3m-account-button wui-button:hover {
        border-color: #a855f7 !important;
        background: rgba(168, 85, 247, 0.1) !important;
        color: #a855f7 !important;
      }

      /* Style divs inside AppKit components (for account display) */
      appkit-account-button > div,
      w3m-account-button > div,
      appkit-button > div,
      w3m-button > div {
        font-family: 'VT323', 'Geist Mono', monospace !important;
        font-size: 0.75rem !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        border: 1px solid #585878 !important;
        background: transparent !important;
        color: #e8e4f0 !important;
        border-radius: 0.25rem !important;
        padding: 0.5rem 1rem !important;
        transition: all 0.3s ease !important;
      }

      appkit-account-button > div:hover,
      w3m-account-button > div:hover,
      appkit-button > div:hover,
      w3m-button > div:hover {
        border-color: #a855f7 !important;
        background: rgba(168, 85, 247, 0.1) !important;
        color: #a855f7 !important;
      }

      /* Target shadow DOM using ::part if available */
      appkit-button::part(button),
      w3m-button::part(button),
      appkit-account-button::part(button),
      w3m-account-button::part(button) {
        font-family: 'VT323', 'Geist Mono', monospace !important;
        font-size: 0.75rem !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        border: 1px solid #585878 !important;
        background: transparent !important;
        color: #e8e4f0 !important;
        border-radius: 0.25rem !important;
        padding: 0.5rem 1rem !important;
      }
    `;
    document.head.appendChild(style);

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial application with delays to catch late-rendered components
    setTimeout(applyStylesToShadowDOM, 100);
    setTimeout(applyStylesToShadowDOM, 500);
    setTimeout(applyStylesToShadowDOM, 1000);

    return () => {
      observer.disconnect();
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
    <div className="appkit-wrapper" style={{ display: 'inline-block' }}>
      <AppKitButton />
    </div>
  );
}

