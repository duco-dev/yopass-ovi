import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { randomString } from '@shared/lib/random';
import { encryptMessage } from '@shared/lib/crypto';
import { postWebhookSecret } from '@shared/lib/api';
import ClientCredentialsResult from './ClientCredentialsResult';

// Hardcoded delivery manager list - can be moved to config later
const deliveryManagers = [
  { id: 'dm1', name: 'John Smith' },
  { id: 'dm2', name: 'Jane Doe' },
  { id: 'dm3', name: 'Mike Johnson' },
  { id: 'dm4', name: 'Sarah Wilson' },
  { id: 'dm5', name: 'David Brown' },
];

export default function ClientCredentials() {
  const { t } = useTranslation();
  const [secret, setSecret] = useState('');
  const [deliveryManager, setDeliveryManager] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  type CredentialsForm = {
    secret: string;
    expiration: string;
    deliveryManager: string;
  };

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CredentialsForm>();

  async function onSubmit(form: CredentialsForm) {
    if (!form.secret || !form.deliveryManager) {
      return;
    }

    setIsSubmitting(true);

    try {
      const password = randomString();
      const { data, status } = await postWebhookSecret({
        expiration: parseInt(form.expiration),
        message: await encryptMessage(form.secret, password),
        one_time: true,
        delivery_manager: form.deliveryManager,
      });

      if (status !== 200) {
        setError('secret', { type: 'submit', message: data.message });
      } else {
        setSubmitSuccess(true);
      }
    } catch (error) {
      setError('secret', { type: 'submit', message: 'Failed to submit credentials. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitSuccess) {
    return <ClientCredentialsResult onReset={() => {
      setSubmitSuccess(false);
      setSecret('');
      setDeliveryManager('');
    }} />;
  }

  return (
    <>
      <h2 className="text-3xl font-bold mb-4">{t('clientCredentials.title')}</h2>
      <p className="mb-6 text-base text-base-content/80">
        {t('clientCredentials.subtitle')}
      </p>

      <div className="alert alert-info mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <div className="font-semibold text-base mb-1">Secure Process</div>
          <div className="text-sm opacity-90">
            {t('clientCredentials.instructions')}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {errors.secret && (
          <div className="mb-4 text-red-600 text-sm font-medium">
            {errors.secret.message?.toString()}
          </div>
        )}

        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text font-semibold text-base">
              {t('clientCredentials.deliveryManagerLabel')}
            </span>
          </label>
          <select
            {...register('deliveryManager', { required: 'Please select a delivery manager' })}
            className="select select-bordered w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            value={deliveryManager}
            onChange={(e) => setDeliveryManager(e.target.value)}
          >
            <option value="">
              {t('clientCredentials.deliveryManagerPlaceholder')}
            </option>
            {deliveryManagers.map((dm) => (
              <option key={dm.id} value={dm.name}>
                {dm.name}
              </option>
            ))}
          </select>
          {errors.deliveryManager && (
            <label className="label">
              <span className="label-text-alt text-red-600">
                {errors.deliveryManager.message}
              </span>
            </label>
          )}
        </div>

        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text font-semibold text-base">
              {t('clientCredentials.inputSecretLabel')}
            </span>
          </label>
          <textarea
            {...register('secret', { required: 'Please enter your credentials' })}
            className="textarea textarea-bordered w-full min-h-[120px] text-base p-4 resize-y focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-base-100"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder={t('clientCredentials.inputSecretPlaceholder')}
            rows={5}
          />
          {errors.secret && (
            <label className="label">
              <span className="label-text-alt text-red-600">
                {errors.secret.message}
              </span>
            </label>
          )}
        </div>

        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text font-semibold text-base text-balance">
              {t('clientCredentials.expirationLegend')}
            </span>
          </label>
          <div className="flex flex-wrap gap-4 mt-2">
            <label className="cursor-pointer flex items-center space-x-3 p-2 rounded-md hover:bg-base-200 transition-colors">
              <input
                type="radio"
                {...register('expiration')}
                className="radio radio-primary"
                defaultChecked={true}
                value="3600"
              />
              <span className="label-text font-medium">
                {t('expiration.optionOneHourLabel')}
              </span>
            </label>
            <label className="cursor-pointer flex items-center space-x-3 p-2 rounded-md hover:bg-base-200 transition-colors">
              <input
                type="radio"
                {...register('expiration')}
                className="radio radio-primary"
                value="86400"
              />
              <span className="label-text font-medium">
                {t('expiration.optionOneDayLabel')}
              </span>
            </label>
            <label className="cursor-pointer flex items-center space-x-3 p-2 rounded-md hover:bg-base-200 transition-colors">
              <input
                type="radio"
                {...register('expiration')}
                className="radio radio-primary"
                value="604800"
              />
              <span className="label-text font-medium">
                {t('expiration.optionOneWeekLabel')}
              </span>
            </label>
          </div>
        </div>

        <div className="form-control mt-8">
          <button
            className="btn btn-primary w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-md"></span>
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                {t('clientCredentials.buttonSubmit')}
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}

