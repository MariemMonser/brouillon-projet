import bcryptjs from 'bcryptjs';

const generateHash = async () => {
  const password = 'admin123';
  const hash = await bcryptjs.hash(password, 10);
  console.log('Copiez ce texte :');
  console.log(hash);
};

generateHash();