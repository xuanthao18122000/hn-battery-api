export const getDefaultAvatar = (name: string) => {
  const backgrounds = ['0D8ABC', 'FF5733', '8E44AD', '2ECC71', 'F1C40F'];

  const randomBackground =
    backgrounds[Math.floor(Math.random() * backgrounds.length)];

  return `https://ui-avatars.com/api/?name=${name}&background=${randomBackground}&color=fff`;
};
