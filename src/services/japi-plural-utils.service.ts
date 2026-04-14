import { App } from 'vue';
/* eslint-disable */
class JapiPluralUtils {
    public getSpanishPluralOfWord(word: string): string {
        if (word != null && word.trim().length > 0) {
            word = word.toLowerCase();

            let pluralWord: string = word;

            let lastLetter: string = word.charAt(word.length - 1);
            let penultimateLetter: string = word.charAt(word.length - 2);

            if (this.isInvariableWord(pluralWord)) return pluralWord;

            if (this.isCaseWithPluralES(lastLetter, penultimateLetter)) {
            	// Si la palabra termina en -z, esta se transforma en una c antes de añadir -es
            	if (lastLetter == 'z') {
            		pluralWord = pluralWord.substring(0, pluralWord.length - 1);
            		pluralWord += 'c';
            	}
            	else if (this.sustantivoTerminadoEnSoXoNoZyPalabraAguda(penultimateLetter, lastLetter)) {
            		pluralWord = pluralWord.substring(0, pluralWord.length - 2);
            		pluralWord += this.obtieneLetraSinAcento(penultimateLetter);
            		pluralWord += lastLetter;
            	}
            	pluralWord += 'es';
            }
            else if (this.isCaseWithPluralS(lastLetter)) {
                pluralWord += 's';
            }

            return pluralWord;
        }
        else {
            return '';
        }
    }

    private obtieneLetraSinAcento(letraConAcento: string): string {
    	switch (letraConAcento) {
	    	case 'á':
	    		return 'a';
	    	case 'Á':
	    		return 'A';
	    	case 'é':
	    		return 'e';
	    	case 'É':
	    		return 'E';
	    	case 'í':
	    		return 'i';
	    	case 'Í':
	    		return 'I';
	    	case 'ó':
	    		return 'o';
	    	case 'Ó':
	    		return 'O';
	    	case 'ú':
	    		return 'u';
	    	case 'Ú':
	    		return 'U';
	    	default:
	    		return ' ';
    	}
    }

    private isCaseWithPluralES(lastLetter: string, penultimateLetter: string): boolean {
        return (penultimateLetter == 'y' && lastLetter == 'o') ||
                (
                        (penultimateLetter == 'a' || penultimateLetter == 'e' || penultimateLetter == 'i' || penultimateLetter == 'o' || penultimateLetter == 'u')
                                && (lastLetter != 'a' && lastLetter != 'e' && lastLetter != 'i' && lastLetter != 'o' && lastLetter != 'u')
                ) ||
                this.sustantivoTerminadoEnSoXoNoZyPalabraAguda(penultimateLetter, lastLetter) ||
                lastLetter == 'í' ||
                lastLetter == 'ú' ||
                (penultimateLetter == 'c' && lastLetter == 'h');
    }

    private sustantivoTerminadoEnSoXoNoZyPalabraAguda(penultimateLetter: string, lastLetter: string): boolean {
    	return ((penultimateLetter == 'á' || penultimateLetter == 'é' || penultimateLetter == 'í' || penultimateLetter == 'ó' || penultimateLetter == 'ú') && (lastLetter == 's' || lastLetter == 'x' || lastLetter == 'n' || lastLetter == 'z'));
    }

    private isCaseWithPluralS(lastLetter: string): boolean {
        return lastLetter == 'a' ||
                lastLetter == 'á' ||
                lastLetter == 'e' ||
                lastLetter == 'o' ||
                lastLetter == 'ó' ||
                lastLetter == 'u' ||
                lastLetter == 'é' ||
                (lastLetter != 'l' && lastLetter != 'r' && lastLetter != 'n' && lastLetter != 'd' && lastLetter != 'z' && lastLetter != 'j' && lastLetter != 's' && lastLetter != 'x');
    }

    private isInvariableWord(word: string): boolean {
        word = word.toLowerCase();
        return word === 'paraguas' || word === 'gafas' || word === 'viveres' || word === 'saltamontes' || word === 'lavacoches' || word === 'pararrayos' || word === 'sacacorchos' || word === 'trabalenguas' || word === 'crisis' || word === 'oasis' || word === 'paracaidas'
                || word === 'quitamanchas' || word === 'alicates' || word === 'parachoques' || word === 'rompeolas' || word === 'salvavidas' || word === 'analisis' || word === 'sintesis' || word === 'fotosintesis' || word === 'portaaviones' || word === 'parabrisas' || word === 'tórax' || word === 'cactus';
    }
}

export const japiPluralUtils = new JapiPluralUtils();

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $japiPluralUtils: JapiPluralUtils;
    }
}

const JapiPluralUtilsService = {
    install: (app: App, options?: any): void => {
        const { globalProperties } = app.config;
        globalProperties.$japiPluralUtils = japiPluralUtils;
        app.provide('$japiPluralUtils', japiPluralUtils);
    },
};

export default JapiPluralUtilsService;