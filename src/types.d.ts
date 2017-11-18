declare module 'config' {
  type Config = {
    STATIC_DEST: [number, number];
  };

  export const config: Config;
}
