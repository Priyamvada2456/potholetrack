import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MapView from "../components/MapView";
import StatusBadge from "../components/StatusBadge";
import { createReport } from "../api/reports";

const LOCATION_STATE = {
  LOCATING: "locating",
  FOUND: "found",
  DENIED: "denied",
};

export default function ReportFormPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [locationState, setLocationState] = useState(LOCATION_STATE.LOCATING);
  const [position, setPosition] = useState(null); // { lat, lng }
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [duplicate, setDuplicate] = useState(null); // { existing_report, message }

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationState(LOCATION_STATE.DENIED);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationState(LOCATION_STATE.FOUND);
      },
      () => {
        setLocationState(LOCATION_STATE.DENIED);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function submit(forceDuplicate = false) {
    setError(null);

    if (!photo) {
      setError("Please add a photo of the pothole.");
      return;
    }
    if (!position) {
      setError("Please set a location by clicking on the map.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createReport({
        photo,
        latitude: position.lat,
        longitude: position.lng,
        description,
        forceDuplicate,
      });

      if (!result.ok) {
        setDuplicate(result.duplicate);
        return;
      }

      navigate(`/reports/${result.report.id}`);
    } catch {
      setError("Something went wrong submitting your report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    submit(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="font-display text-3xl font-semibold text-asphalt-950">Report a Pothole</h1>
      <p className="mt-1 text-asphalt-700">
        Add a clear photo and confirm the location — that's all we need.
      </p>
      <div className="lane-divider my-6 w-24" />

      {duplicate ? (
        <div className="rounded-lg border border-hazard-500 bg-hazard-400/10 p-5">
          <h2 className="font-display text-lg font-semibold">Possible duplicate found</h2>
          <p className="mt-1 text-sm text-asphalt-800">{duplicate.message}</p>

          <div className="mt-4 flex gap-4 rounded-md bg-white p-4">
            <img
              src={`/uploads/${duplicate.existing_report.photo_url}`}
              alt="Existing report"
              className="h-20 w-20 rounded-md object-cover"
            />
            <div>
              <StatusBadge status={duplicate.existing_report.status} />
              <p className="mt-1 text-sm text-asphalt-800">
                {duplicate.existing_report.description || "No description provided"}
              </p>
              <p className="text-xs text-asphalt-700/70">
                {duplicate.existing_report.upvote_count} confirmation(s)
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to={`/reports/${duplicate.existing_report.id}`}
              className="rounded-md bg-asphalt-950 px-4 py-2 text-sm font-semibold text-concrete-100"
            >
              Yes, that's this pothole — take me there
            </Link>
            <button
              onClick={() => {
                setDuplicate(null);
                submit(true);
              }}
              className="rounded-md border border-asphalt-700 px-4 py-2 text-sm font-semibold text-asphalt-950"
            >
              No, it's a different pothole — submit anyway
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block font-display text-sm font-semibold uppercase tracking-wide text-asphalt-800">
              Photo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              capture="environment"
              onChange={handlePhotoChange}
              className="block w-full text-sm text-asphalt-800 file:mr-4 file:rounded-md file:border-0 file:bg-asphalt-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-concrete-100"
            />
            {photoPreview && (
              <img src={photoPreview} alt="Preview" className="mt-3 h-40 w-40 rounded-md object-cover" />
            )}
          </div>

          <div>
            <label className="mb-2 block font-display text-sm font-semibold uppercase tracking-wide text-asphalt-800">
              Location
            </label>
            {locationState === LOCATION_STATE.LOCATING && (
              <p className="text-sm text-asphalt-700">Getting your current location…</p>
            )}
            {locationState === LOCATION_STATE.DENIED && (
              <p className="mb-2 text-sm text-status-reported">
                Couldn't get your location automatically. Tap the map below to drop a pin where the pothole is.
              </p>
            )}
            {locationState === LOCATION_STATE.FOUND && (
              <p className="mb-2 text-sm text-status-fixed">
                Location detected. You can tap the map to adjust it if needed.
              </p>
            )}
            <div className="h-64 overflow-hidden rounded-md border border-asphalt-700/30">
              <MapView
                selectable
                selectedPosition={position}
                onSelectPosition={(lat, lng) => setPosition({ lat, lng })}
                zoom={position ? 16 : 12}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-display text-sm font-semibold uppercase tracking-wide text-asphalt-800">
              Description <span className="font-normal normal-case text-asphalt-700/60">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g. Deep pothole in the left lane, right before the signal"
              className="w-full rounded-md border border-asphalt-700/30 p-3 text-sm focus:border-hazard-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-status-reported">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-hazard-400 px-6 py-3 font-display font-semibold uppercase tracking-wide text-asphalt-950 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit Report"}
          </button>
        </form>
      )}
    </div>
  );
}
