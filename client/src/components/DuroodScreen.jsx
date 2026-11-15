export default function DuroodScreen({ onEnter }) {
  return (
    <div className="wrap">
      <div className="card durood">
        <p className="arabic">اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ</p>
        <p>Durood Pak parh kar app me dakhil hon</p>
        <button className="btn btn-gold" onClick={onEnter}>
          Durood Parh Liya — App Kholein
        </button>
        <p className="meta" style={{ color: "#5c5c55" }}>Asad Tools — Digital Subscriptions &amp; Accounts</p>
      </div>
    </div>
  );
}
