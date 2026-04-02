export const profilePins = {
  Suman: "1234",
  Adhiraj: "2345",
  Sitara: "3456",
};

export function isValidProfilePin(name, pin) {
  return profilePins[name] === pin;
}
