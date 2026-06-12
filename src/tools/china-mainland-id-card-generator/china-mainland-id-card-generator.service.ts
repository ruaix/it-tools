const CHECKSUM_CHARS = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2] as const;
export const REGION_OPTIONS = [
  { label: 'Jiangsu - Xinbei', value: '320411' },
  { label: 'Beijing - Chaoyang', value: '110105' },
  { label: 'Beijing - Haidian', value: '110108' },
  { label: 'Shanghai - Pudong', value: '310115' },
  { label: 'Guangzhou - Tianhe', value: '440106' },
  { label: 'Shenzhen - Nanshan', value: '440305' },
  { label: 'Hangzhou - Xihu', value: '330106' },
] as const;

export interface MainlandIdCardGeneratorOptions {
  count: number
  gender: 'male' | 'female' | 'random'
  minAge: number
  maxAge: number
  regionCodeForUi: string
}

export interface MainlandIdCardRecord {
  id: string
  regionCodeForUi: string
  birthday: string
  gender: 'Male' | 'Female'
  note: string
}

function pad2(value: number) {
  return value.toString().padStart(2, '0');
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomBirthday(minAge: number, maxAge: number) {
  const now = new Date();
  const start = new Date(now.getFullYear() - maxAge, 0, 1).getTime();
  const end = new Date(now.getFullYear() - minAge, 11, 31).getTime();
  const birthday = new Date(randomInt(start, end));

  const year = birthday.getFullYear().toString();
  const month = pad2(birthday.getMonth() + 1);
  const day = pad2(birthday.getDate());

  return `${year}${month}${day}`;
}

function getSequenceCode(gender: MainlandIdCardGeneratorOptions['gender']) {
  const base = randomInt(0, 99).toString().padStart(2, '0');

  if (gender === 'random') {
    return `${base}${randomInt(0, 9)}`;
  }

  const lastDigit = gender === 'male' ? randomInt(0, 4) * 2 + 1 : randomInt(0, 4) * 2;
  return `${base}${lastDigit}`;
}

function getChecksum(value17: string) {
  const sum = value17
    .split('')
    .reduce((total, char, index) => total + Number(char) * WEIGHTS[index], 0);

  return CHECKSUM_CHARS[sum % 11];
}

function makeChecksumInvalid(validChecksum: string) {
  return CHECKSUM_CHARS.find(char => char !== validChecksum) ?? '0';
}

export function generateMainlandIdCardRecords({
  count,
  gender,
  minAge,
  maxAge,
  regionCodeForUi,
}: MainlandIdCardGeneratorOptions): MainlandIdCardRecord[] {
  const selectedRegion = REGION_OPTIONS.find(option => option.value === regionCodeForUi) ?? REGION_OPTIONS[0];

  return Array.from({ length: count }, () => {
    const birthday = getRandomBirthday(minAge, maxAge);
    const sequenceCode = getSequenceCode(gender);
    const value17 = `${regionCodeForUi}${birthday}${sequenceCode}`;
    const validChecksum = getChecksum(value17);
    // const invalidChecksum = makeChecksumInvalid(validChecksum);
    const normalizedGender = Number(sequenceCode[2]) % 2 === 0 ? 'Female' : 'Male';

    return {
      id: `${value17}${validChecksum}`,
      regionCodeForUi: selectedRegion.value,
      birthday: `${birthday.slice(0, 4)}-${birthday.slice(4, 6)}-${birthday.slice(6, 8)}`,
      gender: normalizedGender,
      note: 'Real region data is provided separately for UI testing, while the ID body remains intentionally invalid.',
    };
  });
}
