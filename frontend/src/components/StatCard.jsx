
export default function StatCard({ label, value, isAlert = false }) {
  return (
    <div className="col-12 col-sm-6 col-xl-3">
      <div className={`card stat-card bg-body-tertiary h-100 ${isAlert ? 'border-danger' : 'border-secondary'}`}>
        <div className="card-body">
          <div className="stat-label text-secondary text-uppercase fs-7 fw-semibold">
            {label}
          </div>
          <div className={`stat-value fs-2 fw-bold mt-2 ${isAlert ? 'text-danger' : 'text-warning'}`}>
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}