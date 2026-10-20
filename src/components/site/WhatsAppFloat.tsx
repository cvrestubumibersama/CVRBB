import { useSettings } from "@/lib/api";

export function WhatsAppFloat() {
  const { data: settings } = useSettings();
  const whatsapp = (settings?.whatsapp ?? "6285748185726").replace(/\D/g, "").replace(/^0+/, "62");

  return (
    <a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex h-14 max-w-[56px] items-center overflow-hidden rounded-full bg-[#25D366] px-3 text-white shadow-lg transition-all duration-300 hover:max-w-[250px] hover:px-5 hover:shadow-xl"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        fill="currentColor"
        className="h-8 w-8 shrink-0"
      >
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 413.5c-33.1 0-65.5-8.9-94-25.7l-6.7-4-69.8 18.3L72 334.1l-4.4-7.1c-18.4-29.6-28.1-64.2-28.1-100.8 0-101.4 82.5-183.9 184-183.9 49.1 0 95.3 19.1 130 53.8 34.7 34.7 53.8 80.9 53.8 130 0 101.4-82.6 183.9-183.9 183.9zM315.6 308.2c-5-2.5-29.7-14.7-34.3-16.4-4.6-1.7-8-2.5-11.3 2.5-3.4 5-13 16.4-15.9 19.8-2.9 3.4-5.9 3.8-10.9 1.3-5-2.5-21.2-7.8-40.4-25.1-14.9-13.4-25-29.9-27.9-34.9-2.9-5-.3-7.7 2.2-10.2 2.3-2.3 5-5 7.5-7.5 2.5-2.5 3.4-4.2 5-7.1 1.7-2.9.8-5.5-.4-7.9-1.3-2.5-11.3-27.3-15.5-37.4-4.1-9.9-8.3-8.6-11.3-8.8-2.9-.2-6.3-.2-9.6-.2-3.4 0-8.8 1.3-13.4 6.3-4.6 5-17.6 17.2-17.6 42 0 24.8 18 48.7 20.5 52.1 2.5 3.4 35.6 54.4 86.3 76.3 12.1 5.2 21.5 8.3 28.9 10.6 12.2 3.9 23.3 3.3 32.1 2 9.6-1.4 29.7-12.1 33.9-23.9 4.2-11.8 4.2-21.9 2.9-23.9-1.3-2-4.6-3.3-9.6-5.8z" />
      </svg>
      <span className="ml-2 whitespace-nowrap font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        +{whatsapp}
      </span>
    </a>
  );
}
