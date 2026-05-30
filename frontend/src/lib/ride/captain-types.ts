export type CaptainInfo = {
  name: string;
  phone?: string | null;
  rating?: number;
  vehicle?: {
    brand: string;
    model: string;
    color: string;
    plate: string;
    type: string;
  } | null;
};
