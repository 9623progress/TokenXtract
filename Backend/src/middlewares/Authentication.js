export const isAuthenticated = (req, res) => {
  const token = req.cookies["auth_token"];

  if (token) {
    res.status(200).send({ isAuthenticated: true });
  } else {
    res.status(404).send({ isAuthenticated: false });
  }
};
