export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="app-footer">
      <p className="footer-copy">
        © {year} <strong>Ruang Kritik</strong>. All Rights Reserved.
      </p>
      <p className="footer-team">
        Support Team: <span>Fauzan Helmi</span> · <span>Hamdan Akhirudin</span> · <span>Rio Friyando</span> · <span>Indah Purwanto</span>
      </p>
    </footer>
  )
}
