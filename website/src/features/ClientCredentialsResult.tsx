import { useTranslation } from 'react-i18next';

interface ClientCredentialsResultProps {
  onReset: () => void;
}

function ClientCredentialsResult({ onReset }: ClientCredentialsResultProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-green-700">
            {t('clientCredentialsResult.title')}
          </h2>
          <p className="text-lg text-base-content/80 mb-6">
            {t('clientCredentialsResult.subtitle')}
          </p>
        </div>

        <div className="alert alert-success mb-8 shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <div className="font-semibold text-base mb-1">Secure Delivery Confirmed</div>
            <div className="text-sm opacity-90">
              {t('clientCredentialsResult.nextSteps')}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            className="btn btn-primary px-8 font-medium shadow-sm hover:shadow transition-all duration-200"
            onClick={onReset}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t('clientCredentialsResult.buttonSubmitAnother')}
          </button>

          <button
            className="btn btn-outline btn-primary px-8 font-medium shadow-sm hover:shadow transition-all duration-200 ml-4"
            onClick={() => {
              window.location.href = '/';
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {t('clientCredentialsResult.buttonClose')}
          </button>
        </div>
      </div>
    </>
  );
}

export default ClientCredentialsResult;

