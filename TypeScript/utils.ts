

class Utils {

    public static roundNumber(number: number, digits: number): number {
        let result = number.toFixed(digits);
        return parseFloat(result);
    }

    public static addPips(number: number, pips: number, multiplier: number) {
        let result = number * multiplier - pips;
        return result / multiplier;
    }


    public static Pips(from: number, to: number, multiplier: number, digits: number) {
        return Utils.roundNumber(to * multiplier - from * multiplier, digits);
    }

}