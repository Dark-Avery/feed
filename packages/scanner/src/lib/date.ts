import 'dayjs/locale/ru';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import duration from 'dayjs/plugin/duration';
import isoWeek from 'dayjs/plugin/isoWeek';
import relativeTime from 'dayjs/plugin/relativeTime';
import toObject from 'dayjs/plugin/toObject';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';

dayjs.locale('ru');
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(dayOfYear);
dayjs.extend(isoWeek);
dayjs.extend(weekday);
dayjs.extend(duration);
dayjs.extend(toObject);
dayjs.extend(utc);

export const DATE_FORMAT = 'YYYY-MM-DD';

export const today = dayjs('2022-07-12').format(DATE_FORMAT);
export const breakfast = dayjs(today).add(14, 'h');
export const lunch = dayjs(today).add(20, 'h');
export const dinner = dayjs(today).add(24, 'h');
