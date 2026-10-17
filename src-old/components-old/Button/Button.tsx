import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
};

export default function Button({ isLoading, children, ...rest }: Props) {
  return (
    <button {...rest} disabled={isLoading || rest.disabled}>
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
