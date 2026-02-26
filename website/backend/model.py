import pandas as pd
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

class ScamDetector:
    def __init__(self, filename='spam.csv'):
        self.filename = filename
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(stop_words='english', ngram_range=(1, 2))),
            ('clf', LogisticRegression(solver='lbfgs', max_iter=1000, class_weight='balanced'))
        ])
        self._train_from_csv()

    def _train_from_csv(self):
        if not os.path.exists(self.filename):
            print(f"Error: {self.filename} not found.")
            return

        try:
            # Try reading as a simple two-column CSV without header first
            df = pd.read_csv(self.filename, encoding='latin-1', header=None, usecols=[0, 1], names=['text', 'label'])

            # If columns look like they contain header text (first row as header),
            # pandas would have put data into header when header is not present.
            # The header=None read above forces the first column to be text and second to be label.

            # Drop rows where either column is missing
            df = df.dropna(subset=['text', 'label'])

            # If label column contains strings like 'ham'/'spam' map them to ints
            if df['label'].dtype == object:
                df['label'] = df['label'].astype(str).str.strip()
                mapping = {'ham': 0, 'phishing': 1, 'spam': 2}
                # Try to convert string labels to numeric where possible
                df['label'] = df['label'].map(mapping).fillna(df['label'])

            # Finally, coerce numeric labels to int where possible
            try:
                df['label'] = df['label'].astype(int)
            except Exception:
                # If coercion fails, drop problematic rows
                df = df[pd.to_numeric(df['label'], errors='coerce').notna()]
                df['label'] = df['label'].astype(int)

            if len(df) == 0:
                print(f"No valid training samples found in {self.filename}.")
                return

            print(f"Training model on {len(df)} samples from {self.filename}...")
            self.pipeline.fit(df['text'], df['label'])
            print("Model training complete.")

        except Exception as e:
            print(f"An error occurred during training: {e}")

    def predict(self, text):
        if not hasattr(self.pipeline.named_steps['clf'], 'classes_'):
            return {"isScam": False, "type": "Model Not Trained", "confidence": 0}

        prediction = self.pipeline.predict([text])[0]
        proba = self.pipeline.predict_proba([text])[0]
        confidence = round(float(max(proba)) * 100, 2)
        
        mapping = {
            0: {"isScam": False, "type": "None"},
            1: {"isScam": True, "type": "Phishing"},
            2: {"isScam": True, "type": "Spam / Fraud"}
        }
        
        result = mapping.get(int(prediction), {"isScam": False, "type": "Unknown"}).copy()
        result["confidence"] = confidence
        return result

# Initializing with the filename you provided
detector = ScamDetector('spam.csv')