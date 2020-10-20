interface Listenable {
  listenDictionary: { [key: string]: { func: Function; listeners: Function[] } };
}

export { Listenable };
