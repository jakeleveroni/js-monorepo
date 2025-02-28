export default function isDev() {
  return process.env.APP_ENV === "development";
}
