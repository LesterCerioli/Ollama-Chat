import styled from 'styled-components';

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #7c2d12; /* bg-orange-900 */
  padding: 1rem;
`;

export const Header = styled.header`
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
`;

export const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  color: #ffedd5; /* text-orange-100 */
`;

export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  background-color: #9a3412; /* bg-orange-800 */
  border-radius: 0.5rem;
  max-height: 50vh;
`;

export const EmptyState = styled.div`
  color: #fed7aa; /* text-orange-200 */
  text-align: center;
  padding: 1rem 0;
`;

export const MessageBubble = styled.div<{ sender: 'user' | 'ollama' | 'error' | 'typing' }>`
  padding: 0.75rem;
  border-radius: 0.5rem;
  max-width: 80%;
  margin: 0.25rem 0;
  
  ${({ sender }) => 
    sender === 'user' 
      ? `
        background-color: #ea580c; /* bg-orange-600 */
        color: white;
        margin-left: auto;
      `
      : sender === 'error'
      ? `
        background-color: #b91c1c; /* bg-red-700 */
        color: #ffedd5; /* text-orange-100 */
      `
      : `
        background-color: #9a3412; /* bg-orange-700 */
        color: #ffedd5; /* text-orange-100 */
      `
  }
`;

export const TypingIndicator = styled.span`
  margin-left: 0.25rem;
  display: inline-block;
  vertical-align: middle;
  animation: pulse 1s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

export const InputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  background-color: #9a3412; /* bg-orange-800 */
  padding: 0.5rem;
  border-radius: 0.5rem;
`;

export const Input = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ea580c; /* border-orange-600 */
  border-radius: 0.5rem;
  background-color: #7c2d12; /* bg-orange-900 */
  color: #ffedd5; /* text-orange-100 */
  
  &:focus {
    outline: none;
    ring: 1px solid #f97316; /* focus:ring-orange-500 */
  }

  &::placeholder {
    color: #fdba74; /* placeholder-orange-400 */
  }

  &:disabled {
    opacity: 0.7;
  }
`;

export const Button = styled.button`
  background-color: #ea580c; /* bg-orange-600 */
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  
  &:hover {
    background-color: #f97316; /* hover:bg-orange-500 */
  }

  &:disabled {
    background-color: #9a3412; /* disabled:bg-orange-800 */
  }

  transition: background-color 0.2s;
`;