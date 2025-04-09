import { ProgressBar } from 'react-aria-components';

type Props = {
  loading: boolean;
};
export function LoaderBar({ loading }: Props = { loading: false }) {
  if (!loading) {
    return null;
  }

  return (
    <ProgressBar value={20} className="flex flex-col gap-3 w-56 text-black">
      {({ percentage }) => (
        <>
          <div className="flex">
            <span className="sr-only">loading</span>
          </div>
          <div className="h-2 top-[50%] transform translate-y-[-50%] w-full rounded-full bg-black/40">
            <div
              className="absolute h-2 top-[50%] transform translate-y-[-50%] rounded-full animate-loading-bar bg-black"
              style={{ width: `${percentage}%` }}
            />
            {/* ty claude! */}
            <style>
              {`
                @keyframes loading-bar {
                    0% { left: 0%; }
                    100% { left: 100%; }
                }
                .animate-loading-bar {
                    animation: loading-bar 1s infinite;
                }
            `}
            </style>
          </div>
        </>
      )}
    </ProgressBar>
  );
}
