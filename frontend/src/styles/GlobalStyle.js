import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding-bottom: 80px; /* Space for bottom navigation */
  }

  .main-content {
    flex: 1;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    
    @media (max-width: 768px) {
      padding: 0.5rem;
    }
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    margin-bottom: 0.5rem;
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  }

  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }

  h4 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }

  p {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  /* Links */
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }

  /* Form Elements */
  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    padding: 0.75rem 1rem;
    background-color: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
    }

    &:disabled {
      background-color: ${({ theme }) => theme.colors.surfaceHover};
      cursor: not-allowed;
      opacity: 0.6;
    }

    &::placeholder {
      color: ${({ theme }) => theme.colors.textMuted};
    }
  }

  /* Buttons */
  button {
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-decoration: none;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-decoration: none;
    border: none;
    cursor: pointer;

    &--primary {
      background-color: ${({ theme }) => theme.colors.primary};
      color: white;

      &:hover:not(:disabled) {
        background-color: ${({ theme }) => theme.colors.primaryHover};
        transform: translateY(-1px);
      }
    }

    &--secondary {
      background-color: transparent;
      color: ${({ theme }) => theme.colors.text};
      border: 1px solid ${({ theme }) => theme.colors.border};

      &:hover:not(:disabled) {
        background-color: ${({ theme }) => theme.colors.surfaceHover};
        border-color: ${({ theme }) => theme.colors.borderHover};
      }
    }

    &--success {
      background-color: ${({ theme }) => theme.colors.success};
      color: white;

      &:hover:not(:disabled) {
        background-color: #059669;
        transform: translateY(-1px);
      }
    }

    &--danger {
      background-color: ${({ theme }) => theme.colors.error};
      color: white;

      &:hover:not(:disabled) {
        background-color: #dc2626;
        transform: translateY(-1px);
      }
    }

    &--small {
      padding: 0.5rem 1rem;
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
    }

    &--large {
      padding: 1rem 2rem;
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
    }

    &--full {
      width: 100%;
    }
  }

  /* Cards */
  .card {
    background-color: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    padding: 1.5rem;
    box-shadow: ${({ theme }) => theme.shadows.sm};
    transition: box-shadow 0.2s ease, transform 0.2s ease;

    &:hover {
      box-shadow: ${({ theme }) => theme.shadows.md};
      transform: translateY(-2px);
    }

    &__header {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border};

      h3 {
        margin-bottom: 0;
      }
    }

    &__body {
      margin-bottom: 1rem;
    }

    &__footer {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid ${({ theme }) => theme.colors.border};
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
  }

  /* Grid */
  .grid {
    display: grid;
    gap: 1rem;

    &--2 {
      grid-template-columns: repeat(2, 1fr);
    }

    &--3 {
      grid-template-columns: repeat(3, 1fr);
    }

    &--4 {
      grid-template-columns: repeat(4, 1fr);
    }

    @media (max-width: 768px) {
      &--2, &--3, &--4 {
        grid-template-columns: 1fr;
      }
    }
  }

  /* Utilities */
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .text-left { text-align: left; }

  .text-xs { font-size: ${({ theme }) => theme.typography.fontSize.xs}; }
  .text-sm { font-size: ${({ theme }) => theme.typography.fontSize.sm}; }
  .text-base { font-size: ${({ theme }) => theme.typography.fontSize.base}; }
  .text-lg { font-size: ${({ theme }) => theme.typography.fontSize.lg}; }
  .text-xl { font-size: ${({ theme }) => theme.typography.fontSize.xl}; }

  .font-medium { font-weight: ${({ theme }) => theme.typography.fontWeight.medium}; }
  .font-semibold { font-weight: ${({ theme }) => theme.typography.fontWeight.semibold}; }
  .font-bold { font-weight: ${({ theme }) => theme.typography.fontWeight.bold}; }

  .text-primary { color: ${({ theme }) => theme.colors.primary}; }
  .text-secondary { color: ${({ theme }) => theme.colors.textSecondary}; }
  .text-muted { color: ${({ theme }) => theme.colors.textMuted}; }
  .text-success { color: ${({ theme }) => theme.colors.success}; }
  .text-warning { color: ${({ theme }) => theme.colors.warning}; }
  .text-error { color: ${({ theme }) => theme.colors.error}; }

  .mb-0 { margin-bottom: 0; }
  .mb-1 { margin-bottom: 0.25rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 0.75rem; }
  .mb-4 { margin-bottom: 1rem; }
  .mb-6 { margin-bottom: 1.5rem; }
  .mb-8 { margin-bottom: 2rem; }

  .mt-0 { margin-top: 0; }
  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-3 { margin-top: 0.75rem; }
  .mt-4 { margin-top: 1rem; }
  .mt-6 { margin-top: 1.5rem; }
  .mt-8 { margin-top: 2rem; }

  /* Loading Animation */
  .loading-pulse {
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }

  /* Fade animations */
  .fade-in {
    animation: fadeIn 0.3s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Mobile-first responsive design */
  @media (max-width: 640px) {
    .main-content {
      padding: 0.5rem;
    }

    .card {
      padding: 1rem;
    }

    h1 {
      font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    }

    h2 {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.borderHover};
  }

  /* Selection */
  ::selection {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.text};
  }

  /* Focus visible */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export default GlobalStyle;
