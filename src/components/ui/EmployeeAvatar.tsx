import { useEffect, useState } from 'react';

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
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  const showImage = Boolean(photoUrl?.trim()) && !imageFailed;
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
      src={photoUrl!}
      alt={`${fullName} avatar`}
      onError={() => setImageFailed(true)}
    />
  );
}