import type { Block } from "@/types";

const HeadingBlock = ({ data }: { data: Record<string, unknown> }) => {
  const Tag = `h${data.level || 1}` as keyof JSX.IntrinsicElements;
  const sizes: Record<number, string> = {
    1: "text-4xl font-bold", 2: "text-3xl font-bold", 3: "text-2xl font-semibold",
    4: "text-xl font-semibold", 5: "text-lg font-medium", 6: "text-base font-medium",
  };
  return <Tag className={`${sizes[Number(data.level) || 1]} text-gray-900 mb-4`}>{String(data.text)}</Tag>;
};

const ParagraphBlock = ({ data }: { data: Record<string, unknown> }) => (
  <div className="text-gray-700 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: String(data.text || "") }} />
);

const ImageBlock = ({ data }: { data: Record<string, unknown> }) => (
  <figure className="mb-6">
    <img
      src={String(data.src || `/uploads/${data.filepath || ""}`)}
      alt={String(data.alt || "")}
      className="rounded-lg w-full"
      loading="lazy"
    />
    {data.caption && <figcaption className="mt-2 text-sm text-gray-500 text-center">{String(data.caption)}</figcaption>}
  </figure>
);

const VideoBlock = ({ data }: { data: Record<string, unknown> }) => {
  const url = String(data.url || "");
  const embedUrl = url.includes("youtube.com") || url.includes("youtu.be")
    ? `https://www.youtube.com/embed/${url.split(/[=/]/).pop()}`
    : url.includes("vimeo.com")
    ? `https://player.vimeo.com/video/${url.split("/").pop()}`
    : url;

  return (
    <div className="mb-6 aspect-video">
      <iframe src={embedUrl} className="w-full h-full rounded-lg" allowFullScreen title="Video" />
    </div>
  );
};

const TestimonialBlock = ({ data }: { data: Record<string, unknown> }) => (
  <blockquote className="mb-6 border-l-4 border-brand-500 pl-6 py-4 bg-gray-50 rounded-r-lg">
    <p className="text-lg text-gray-700 italic">&ldquo;{String(data.quote)}&rdquo;</p>
    <footer className="mt-3 text-sm text-gray-500">
      <strong>{String(data.author)}</strong>
      {data.role && <span> — {String(data.role)}</span>}
    </footer>
  </blockquote>
);

const FeatureListBlock = ({ data }: { data: Record<string, unknown> }) => {
  const features = (data.features || []) as Array<Record<string, string>>;
  const layout = data.layout === "list" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-3 gap-6";
  return (
    <div className={`mb-6 ${layout}`}>
      {features.map((f, i) => (
        <div key={i} className="p-4 rounded-lg border border-gray-200">
          {f.icon && <span className="text-2xl mb-2 block">{f.icon}</span>}
          <h3 className="font-semibold text-gray-900">{f.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{f.description}</p>
        </div>
      ))}
    </div>
  );
};

const CardGridBlock = ({ data }: { data: Record<string, unknown> }) => {
  const cards = (data.cards || []) as Array<Record<string, string>>;
  const cols = Number(data.columns) || 3;
  const gridClass = cols === 2 ? "md:grid-cols-2" : cols === 4 ? "md:grid-cols-4" : "md:grid-cols-3";
  return (
    <div className={`mb-6 grid grid-cols-1 ${gridClass} gap-6`}>
      {cards.map((card, i) => (
        <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-5">
            <h3 className="font-semibold text-gray-900">{card.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{card.description}</p>
            {card.linkUrl && (
              <a href={card.linkUrl} className="text-sm text-brand-600 mt-2 inline-block hover:underline">Learn more →</a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const ContactFormBlock = ({ data }: { data: Record<string, unknown> }) => {
  const fields = (data.fields || []) as Array<Record<string, unknown>>;
  return (
    <div className="mb-6 bg-gray-50 rounded-lg p-6">
      <form action="/api/forms" method="POST" className="space-y-4">
        <input type="hidden" name="formName" value="contact" />
        <input type="text" name="_hp" className="hidden" tabIndex={-1} autoComplete="off" />
        {fields.map((field, i) => (
          <div key={i}>
            <label className="label">{String(field.name)}</label>
            {field.type === "textarea" ? (
              <textarea name={String(field.name)} required={!!field.required} className="input" rows={4} />
            ) : (
              <input type={String(field.type || "text")} name={String(field.name)} required={!!field.required} className="input" />
            )}
          </div>
        ))}
        <button type="submit" className="btn-primary">{String(data.submitLabel || "Submit")}</button>
      </form>
    </div>
  );
};

const NewsletterBlock = ({ data }: { data: Record<string, unknown> }) => (
  <div className="mb-6 bg-brand-50 rounded-lg p-8 text-center">
    <h3 className="text-xl font-bold text-gray-900">{String(data.heading || "Subscribe")}</h3>
    {data.description && <p className="text-gray-600 mt-2">{String(data.description)}</p>}
    <form action="/api/forms" method="POST" className="mt-4 flex gap-2 max-w-md mx-auto">
      <input type="hidden" name="formName" value="newsletter" />
      <input type="email" name="email" required placeholder="your@email.com" className="input flex-1" />
      <button type="submit" className="btn-primary">{String(data.buttonLabel || "Subscribe")}</button>
    </form>
  </div>
);

const RichtextBlock = ({ data }: { data: Record<string, unknown> }) => (
  <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: String(data.content || "") }} />
);

const BLOCK_COMPONENTS: Record<string, React.FC<{ data: Record<string, unknown> }>> = {
  heading: HeadingBlock,
  paragraph: ParagraphBlock,
  richtext: RichtextBlock,
  image: ImageBlock,
  video: VideoBlock,
  testimonial: TestimonialBlock,
  feature_list: FeatureListBlock,
  card_grid: CardGridBlock,
  contact_form: ContactFormBlock,
  newsletter: NewsletterBlock,
};

export const BlockRenderer = ({ blocks }: { blocks: Block[] }) => (
  <div>
    {blocks
      .sort((a, b) => a.order - b.order)
      .map((block) => {
        const Component = BLOCK_COMPONENTS[block.type];
        if (!Component) return <div key={block.id} className="text-red-500">Unknown block: {block.type}</div>;
        return <Component key={block.id} data={block.data} />;
      })}
  </div>
);
