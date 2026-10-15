import { useState } from 'react';

interface EmployeeAvatarProps {
  fullName: string;
  photoUrl: string | null;
  className?: string;
}

export function EmployeeAvatar({
  fullName,
  photoUrl,
  className = '',
}: EmployeeAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const normalizedUrl = photoUrl?.trim() || '';
  const showImage = Boolean(normalizedUrl) && failedUrl !== normalizedUrl;
  const initial = fullName.trim().charAt(0).toUpperCase() || '?';

  if (!showImage) {
    return (
      <div
        className={`employee-avatar employee-avatar-fallback ${className}`.trim()}
        role="img"
        aria-label={`${fullName} avatar`}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      className={`employee-avatar ${className}`.trim()}
      src={normalizedUrl}
      alt={`${fullName} avatar`}
      onError={() => setFailedUrl(normalizedUrl)}
    />
  );
}