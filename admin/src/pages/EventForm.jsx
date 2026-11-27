
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createEvent,
  fetchAdminEvents,
  updateEvent,
} from '../store/slices/eventsSlice';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket,
  Image,
  User,
  Plus,
  Trash2,
  Save,
  Star,
} from 'lucide-react';
import client from '../api/client';

const empty = {
  title: '',
  description: '',
  shortDescription: '',
  category: 'Technology',
  bannerImage: '',
  startDate: '',
  endDate: '',
  startTime: '10:00',
  endTime: '18:00',
  venue: {
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
  },
  organizer: {
    name: 'EventNest',
    email: '',
    phone: '',
  },
  ticketTypes: [{
    name: 'General',
    price: 999,
    totalCapacity: 100,
    maxPerBooking: 5,
    isActive: true,
  }],
  status: 'DRAFT',
};

const inputClass =
  'w-full min-w-0 bg-navy border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple transition placeholder:text-slate-500';

const labelClass =
  'block text-sm font-medium text-slate-300 mb-2';

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="bg-card border border-white/5 rounded-2xl p-4 sm:p-5 md:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-purple/15 text-purple flex items-center justify-center">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-white">{title}</h2>
          <p className="text-xs text-slate-400 mt-1">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

export default function EventForm() {
  const { id } = useParams();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(
    (s) => s.adminEvents.loading
  );

  useEffect(() => {
    if (!id) return;

    client.get(`/events/${id}`)
      .then(({ data }) => {
        const e = data.data.event;

        setForm({
          ...empty,
          ...e,
          venue: { ...empty.venue, ...e.venue },
          organizer: { ...empty.organizer, ...e.organizer },
          ticketTypes: e.ticketTypes?.length
            ? e.ticketTypes
            : empty.ticketTypes,
          startDate: e.startDate?.slice(0, 10),
          endDate: e.endDate?.slice(0, 10),
        });
      })
      .catch(() => {
        setError('Unable to load event details.');
      });
  }, [id]);

  const set = (path, value) => {
    setForm((prev) => {
      const next = structuredClone(prev);
      const keys = path.split('.');
      let cur = next;

      keys.slice(0, -1).forEach((k) => {
        cur = cur[k];
      });

      cur[keys.at(-1)] = value;
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const body = {
        ...form,
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
      };

      const res = id
        ? await dispatch(updateEvent({ id, body }))
        : await dispatch(createEvent(body));

      if (res.meta.requestStatus === 'fulfilled') {
        dispatch(fetchAdminEvents());
        navigate('/events');
      } else {
        setError(
          typeof res.payload === 'string'
            ? res.payload
            : 'Unable to save event.'
        );
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  const addTicket = () => {
    setForm((p) => ({
      ...p,
      ticketTypes: [
        ...p.ticketTypes,
        {
          name: 'VIP',
          price: 1999,
          totalCapacity: 50,
          maxPerBooking: 5,
          isActive: true,
        },
      ],
    }));
  };

  const removeTicket = (idx) => {
    setForm((p) => ({
      ...p,
      ticketTypes: p.ticketTypes.filter(
        (_, i) => i !== idx
      ),
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-10 min-w-0">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">

        <div className="flex items-start gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="w-10 h-10 shrink-0 rounded-xl bg-card border border-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              {id ? 'Edit Event' : 'Create Event'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage your event details and tickets.
            </p>
          </div>
        </div>

        <span className="self-start sm:self-center text-xs font-semibold bg-purple/15 text-purple px-4 py-2 rounded-full">
          {id ? 'EDIT MODE' : 'NEW EVENT'}
        </span>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 mb-5 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">

        {/* BASIC INFORMATION */}
        <Section
          icon={Image}
          title="Basic Information"
          description="Add the main information about your event."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="md:col-span-2">
              <Field label="Event Title">
                <input
                  className={inputClass}
                  placeholder="Enter event title"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  required
                />
              </Field>
            </div>

            <Field label="Category">
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {[
                  'Technology',
                  'Music',
                  'Business',
                  'Education',
                  'Sports',
                  'Workshops',
                  'Entertainment',
                  'Cultural',
                  'Conferences',
                  'Networking',
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Event Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                {[
                  'DRAFT',
                  'PUBLISHED',
                  'SOLD_OUT',
                  'COMPLETED',
                  'CANCELLED',
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Description">
                <textarea
                  className={inputClass}
                  rows={4}
                  placeholder="Describe your event..."
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  required
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Short Description">
                <input
                  className={inputClass}
                  placeholder="Short event summary"
                  value={form.shortDescription || ''}
                  onChange={(e) => set('shortDescription', e.target.value)}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Banner Image URL">
                <input
                  className={inputClass}
                  placeholder="https://example.com/image.jpg"
                  value={form.bannerImage || ''}
                  onChange={(e) => set('bannerImage', e.target.value)}
                />
              </Field>

              {form.bannerImage && (
                <img
                  src={form.bannerImage}
                  alt="Event banner preview"
                  className="mt-3 w-full max-h-48 object-cover rounded-xl border border-white/10"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 bg-navy rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(form.isFeatured)}
              onChange={(e) => set('isFeatured', e.target.checked)}
              className="accent-purple w-4 h-4"
            />
            <Star size={18} className="text-yellow-400" />
            <span className="text-sm font-medium">
              Feature this event
            </span>
          </label>
        </Section>

        {/* EVENT SCHEDULE */}
        <Section
          icon={Calendar}
          title="Event Schedule"
          description="Set the event date and timings."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Field label="Start Date">
              <input
                type="date"
                className={inputClass}
                value={form.startDate || ''}
                onChange={(e) => set('startDate', e.target.value)}
                required
              />
            </Field>

            <Field label="End Date">
              <input
                type="date"
                className={inputClass}
                min={form.startDate || undefined}
                value={form.endDate || ''}
                onChange={(e) => set('endDate', e.target.value)}
                required
              />
            </Field>

            <Field label="Start Time">
              <input
                type="time"
                className={inputClass}
                value={form.startTime || ''}
                onChange={(e) => set('startTime', e.target.value)}
              />
            </Field>

            <Field label="End Time">
              <input
                type="time"
                className={inputClass}
                value={form.endTime || ''}
                onChange={(e) => set('endTime', e.target.value)}
              />
            </Field>
          </div>
        </Section>

        {/* VENUE DETAILS */}
        <Section
          icon={MapPin}
          title="Venue Details"
          description="Where will your event take place?"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Field label="Venue Name">
              <input
                className={inputClass}
                placeholder="Venue name"
                value={form.venue.name}
                onChange={(e) => set('venue.name', e.target.value)}
                required
              />
            </Field>

            <Field label="City">
              <input
                className={inputClass}
                placeholder="City"
                value={form.venue.city}
                onChange={(e) => set('venue.city', e.target.value)}
                required
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Address">
                <input
                  className={inputClass}
                  placeholder="Complete venue address"
                  value={form.venue.address}
                  onChange={(e) => set('venue.address', e.target.value)}
                  required
                />
              </Field>
            </div>

            <Field label="State">
              <input
                className={inputClass}
                placeholder="State"
                value={form.venue.state || ''}
                onChange={(e) => set('venue.state', e.target.value)}
              />
            </Field>

            <Field label="Pincode">
              <input
                className={inputClass}
                placeholder="Pincode"
                value={form.venue.pincode || ''}
                onChange={(e) => set('venue.pincode', e.target.value)}
              />
            </Field>
          </div>
        </Section>

        {/* ORGANIZER DETAILS */}
        <Section
          icon={User}
          title="Organizer Details"
          description="Contact details of the event organizer."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Field label="Organizer Name">
              <input
                className={inputClass}
                placeholder="Organizer name"
                value={form.organizer.name}
                onChange={(e) =>
                  set('organizer.name', e.target.value)
                }
                required
              />
            </Field>

            <Field label="Organizer Email">
              <input
                type="email"
                className={inputClass}
                placeholder="Email address"
                value={form.organizer.email || ''}
                onChange={(e) =>
                  set('organizer.email', e.target.value)
                }
              />
            </Field>

            <Field label="Organizer Phone">
              <input
                type="tel"
                className={inputClass}
                placeholder="Phone number"
                value={form.organizer.phone || ''}
                onChange={(e) =>
                  set('organizer.phone', e.target.value)
                }
              />
            </Field>

          </div>
        </Section>

        {/* TICKET TYPES */}
        <Section
          icon={Ticket}
          title="Ticket Types"
          description="Configure ticket prices and capacity."
        >

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <p className="text-sm text-slate-400">
              {form.ticketTypes.length} ticket tier(s)
            </p>

            <button
              type="button"
              onClick={addTicket}
              className="flex items-center justify-center gap-2 bg-purple/15 text-purple px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple/25"
            >
              <Plus size={17} />
              Add Ticket Tier
            </button>

          </div>

          <div className="space-y-4">

            {form.ticketTypes.map((tt, idx) => (
              <div
                key={idx}
                className="border border-white/10 rounded-xl p-3 sm:p-4 space-y-4"
              >

                <div className="flex items-center justify-between gap-2">

                  <p className="font-semibold text-sm">
                    Ticket Tier {idx + 1}
                  </p>

                  {form.ticketTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicket(idx)}
                      className="flex items-center gap-1 text-rose-400 text-xs hover:text-rose-300"
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  )}

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                  <Field label="Tier Name">
                    <input
                      className={inputClass}
                      placeholder="General / VIP"
                      value={tt.name}
                      onChange={(e) =>
                        set(
                          `ticketTypes.${idx}.name`,
                          e.target.value
                        )
                      }
                      required
                    />
                  </Field>

                  <Field label="Price (₹)">
                    <input
                      type="number"
                      min="0"
                      className={inputClass}
                      value={tt.price}
                      onChange={(e) =>
                        set(
                          `ticketTypes.${idx}.price`,
                          Number(e.target.value)
                        )
                      }
                      required
                    />
                  </Field>

                  <Field label="Total Capacity">
                    <input
                      type="number"
                      min="1"
                      className={inputClass}
                      value={tt.totalCapacity}
                      onChange={(e) =>
                        set(
                          `ticketTypes.${idx}.totalCapacity`,
                          Number(e.target.value)
                        )
                      }
                      required
                    />
                  </Field>

                </div>

              </div>
            ))}

          </div>

        </Section>

        {/* SUBMIT BUTTONS */}
        <div className="sticky bottom-0 z-20 bg-navy/95 backdrop-blur-md border-t border-white/10 py-4 -mx-3 px-3 sm:mx-0 sm:px-0 sm:static sm:bg-transparent sm:border-0 sm:pt-2">

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">

            <button
              type="button"
              onClick={() => navigate('/events')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple hover:bg-purple/90 disabled:opacity-50 px-7 py-3 rounded-xl font-semibold text-sm"
            >
              <Save size={17} />

              {loading
                ? 'Saving...'
                : id
                  ? 'Save Changes'
                  : 'Create Event'}

            </button>

          </div>

        </div>

      </form>

    </div>
  );
}
