export interface Param {
  ty: string;
}

export interface NumericMethodHead {
  baseTy: string;
}

export interface InternalMethodHead {
  receiver: {
    Param: Param;
  };
}

export interface ConcreteMethodHead {
  receiver: {
    Param: Param;
  };
}

export interface AlgorithmHead {
  NumericMethodHead?: NumericMethodHead;
  InternalMethodHead?: InternalMethodHead;
  ConcreteMethodHead?: ConcreteMethodHead;
}

export interface Algorithm {
  head: AlgorithmHead;
}

export interface AlgorithmFile {
  Algorithm: Algorithm;
}

export interface TypeInfo {
  type: string;
  appearsIn: string[];
}

export interface ExtractorOutput {
  "concrete method receivers": TypeInfo[];
  "numeric method receivers": TypeInfo[];
  "internal method receivers": TypeInfo[];
}
